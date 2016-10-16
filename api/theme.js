
import crypto from 'crypto';
import Backbone from 'backbone';
import Sifter from 'sifter';
import { ObjectID } from 'mongodb';
import ThemeModel from '../public/js/model/theme';


let options = {
    CONST: undefined,
    database: undefined,
    fileApi: undefined,
};


function setOptions(hash) {
    options = hash;
}

function addThemeInUserSession(session, theme) {
    theme._id = theme._id.toString();

    if (!session.themes) {
        session.themes = [];
    }

    session.themes.push( theme._id );
    return true;
}


class Api {
    static post(req, res) {
        if (!req.session.user) {
            res.sendStatus(401);
        }

        Api.createTheme( req.session, req.session.user._id.toString() )
        .then((result) => {
            result._id = result._id.toString();
            res.send(result);
        })
        .catch((errorCode) => {
            res.sendStatus(errorCode);
        });
    }

    static createTheme(session, userId) {
        Backbone.Relational.store.reset();

        const collection = options.database.collection('theme');
        const model = new ThemeModel({
            userId,
            owners: [ userId ],
        });

        return new Promise((resolve, reject) => {
            Api.getNewFragment()
            .then((fragment) => {
                model.set('fragment', fragment);

                collection.insertOne(
                    model.toJSON(),
                    { safe: true },
                    (err, results) => {
                        if (err) {
                            return reject(500);
                        }

                        const result = results.ops[0];

                        addThemeInUserSession(session, result);

                        return resolve(result);
                    }
                );
            });
        });
    }

    static getNewFragment() {
        const collection = options.database.collection('theme');
        const shasum = crypto.createHash('sha1');

        shasum.update([
            new Date().getTime().toString(),
        ].join('') );

        const fragment = shasum.digest('hex').substr(0, 6);

        return new Promise((resolve, reject) => {
            collection.find({
                fragment,
            })
            .toArray((err, results) => {
                if (err) {
                    return reject(500);
                }

                if (results.length === 0) {
                    return resolve(fragment);
                }

                return Api.getNewFragment();
            });
        });
    }


    static get(req, res) {
        if ( !req.params._id || !options.CONST.pattern.mongoId.test( req.params._id ) ) {
            res.sendStatus(400);

            return true;
        }

        const collection = options.database.collection('theme');

        collection.find({
            _id: new ObjectID(req.params._id),
        })
        .toArray((err, results) => {
            if (err) {
                res.sendStatus(500);

                return true;
            }

            if (results.length === 0) {
                res.sendStatus(404);

                return true;
            }

            const result = results[0];
            result._id = result._id.toString();

            return res.send(result);
        });

        return true;
    }


    static getAll(req, res) {
        const collection = options.database.collection('theme');
        const filters = {};

        if (req.query.hasLayer) {
            filters.layers = {
                $exists: true,
                $not: {
                    $size: 0,
                },
            };
        }

        if ( req.query.fragment ) {
            Api.findFromFragment(req.query.fragment)
            .then((theme) => {
                res.send(theme);
            })
            .catch((errorCode) => {
                res.sendStatus(errorCode);
            });

            return true;
        }


        collection.find(
            filters
        )
        .toArray((err, results) => {
            if (err) {
                res.sendStatus(500);

                return true;
            }

            if (results.length > 0) {
                results.forEach((result) => {
                    result._id = result._id.toString();
                });
            }

            if ( req.query.q ) {
                if (req.query.q.length < 3) {
                    return res.status(400).send('Query too short');
                }

                const searchFields = [];

                for (const theme of results) {
                    const layerfields = [];
                    const localefields = [];

                    for (const layer of theme.layers) {
                        for (const locale in layer.locales) {
                            if ({}.hasOwnProperty.call(layer.locales, locale)) {
                                localefields.push([
                                    layer.locales[locale].name,
                                    layer.locales[locale].description,
                                ].join(' '));
                            }
                        }

                        layerfields.push([
                            layer.name,
                            layer.description,
                            layer.overpassRequest,
                        ].join(' '));
                    }

                    for (const locale in theme.locales) {
                        if ({}.hasOwnProperty.call(theme.locales, locale)) {
                            localefields.push([
                                theme.locales[locale].name,
                                theme.locales[locale].description,
                            ].join(' '));
                        }
                    }

                    searchFields.push({
                        name: theme.name,
                        description: theme.description,
                        fragment: theme.fragment,
                        layers: layerfields.join(' '),
                        locales: localefields.join(' '),
                    });
                }

                const searchResults = [];
                const sifter = new Sifter(searchFields);
                const sifterResults = sifter.search(
                    req.query.q,
                    {
                        fields: [
                            'name',
                            'description',
                            'fragment',
                            'layers',
                            'locales',
                        ],
                        limit: 30,
                    }
                );

                for (const result of sifterResults.items) {
                    searchResults.push(
                        results[result.id]
                    );
                }

                return res.send(searchResults);
            }

            return res.send(results);
        });

        return true;
    }


    static findFromFragment(fragment) {
        return new Promise((resolve, reject) => {
            const collection = options.database.collection('theme');

            if ( !fragment || !options.CONST.pattern.fragment.test( fragment ) ) {
                reject(400);
                return;
            }

            collection.find({
                fragment,
            })
            .toArray((err, results) => {
                if (err) {
                    reject(500);
                    return;
                }

                if (results.length === 0) {
                    reject(404);
                    return;
                }

                const result = results[0];
                result._id = result._id.toString();

                resolve(result);
            });
        });
    }


    static findFromOwnerId(ownerId) {
        return new Promise((resolve, reject) => {
            const collection = options.database.collection('theme');

            if ( !ownerId || !options.CONST.pattern.mongoId.test( ownerId ) ) {
                reject(400);
                return;
            }

            collection.find({
                $or: [
                    { owners: ownerId },
                    { owners: '*' },
                ],
            })
            .toArray((err, results) => {
                if (err) {
                    reject(500);
                    return;
                }

                resolve(
                    results.map((result) => {
                        result._id = result._id.toString();
                        return result;
                    })
                );
            });
        });
    }


    static put(req, res) {
        if ( !options.CONST.pattern.mongoId.test( req.params._id ) ) {
            res.sendStatus(400);

            return true;
        }

        if ( !Api.isThemeOwner(req, res, req.params._id) ) {
            res.sendStatus(401);

            return true;
        }

        Backbone.Relational.store.reset();

        const newJson = req.body;
        const collection = options.database.collection('theme');
        const model = new ThemeModel(newJson);

        if ( !model.isValid() ) {
            res.sendStatus(400);

            return true;
        }

        delete (newJson._id);

        collection.updateOne({
            _id: new ObjectID(req.params._id),
        },
        newJson,
        { safe: true },
        (err) => {
            if (err) {
                res.sendStatus(500);

                return true;
            }

            options.fileApi.cleanThemeFiles(model);

            return res.send({});
        });

        return true;
    }


    static delete(req, res) {
        if ( !options.CONST.pattern.mongoId.test( req.params._id ) ) {
            res.sendStatus(400);

            return true;
        }

        if ( !Api.isThemeOwner(req, res, req.params._id) ) {
            res.sendStatus(401);

            return true;
        }


        const collection = options.database.collection('theme');

        collection.remove({
            _id: new ObjectID(req.params._id),
        },
        { safe: true },
        (err) => {
            if (err) {
                res.sendStatus(500);

                return true;
            }

            return res.send({});
        });

        return true;
    }


    static isThemeOwner(req, res, themeId) {
        if ( !req.session.user || !req.session.themes ) {
            return false;
        }

        if ( req.session.themes.indexOf( themeId ) === -1 ) {
            return false;
        }

        return true;
    }
}


export default {
    setOptions,
    Api,
};
