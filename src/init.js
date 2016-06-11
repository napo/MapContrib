
import { ObjectID } from 'mongodb';
import Database from './database';


let database = new Database();

database.connect((err, db) => {
    if (err) throw err;

    let init = new Init(db);

    console.log('Database initialization...');

    init.cleanDatabase()
    .then( init.fillDatabase.bind(init), onCatch)
    .then( init.createIndexes.bind(init), onCatch)
    .then(() => {
        console.log('Initialization finished');
        db.close();
    })
    .catch(onCatch);
});


function onCatch (err) {
    throw err;
}

function dummyPromiseCallback (resolve, reject, err) {
    if (err) {
        reject(err);
        throw err;
    }

    resolve();
}


class Init {
    constructor (db) {
        this._db = db;
        this._themeCollection = undefined;
        this._layerCollection = undefined;
        this._userCollection = undefined;
    }

    cleanDatabase () {
        let dropPromises = [
            new Promise((resolve, reject) => {
                this._db.dropCollection('theme', err => {
                    resolve();
                });
            }),
            new Promise((resolve, reject) => {
                this._db.dropCollection('layer', err => {
                    resolve();
                });
            })
        ];

        return Promise.all(dropPromises)
        .then(() => {
            console.log('Database cleaned');
        })
        .catch(err => {
            throw err;
        });
    }

    fillDatabase () {
        let insertPromises = [
            new Promise((resolve, reject) => {
                this._db.createCollection('theme', (err, collection) => {
                    this._themeCollection = collection;

                    this._themeCollection.insertOne({
                            '_id' : new ObjectID('5249c43c6e789470197b5973'),
                            'name': 'MapContrib',
                            'description': 'Ceci est une description :)',
                            'fragment': 's8c2d4',
                            'color': 'blue',
                            'tiles': [

                                'osmFr',
                                'mapboxStreetsSatellite',
                                'osmRoads',
                                'transport',
                                'hot',
                                'openCycleMap',
                                'watercolor',
                                'osmMonochrome',
                                'hydda',
                                'openTopoMap',
                                'openRiverboatMap'
                            ],
                            'zoomLevel': 12,
                            'center': {
                                'lat': 44.82921,
                                'lng': -0.5834,
                            },
                        },
                        {'safe': true},
                        dummyPromiseCallback.bind(this, resolve, reject)
                    );
                });
            }),
            new Promise((resolve, reject) => {
                this._db.createCollection('layer', (err, collection) => {
                    this._layerCollection = collection;

                    this._layerCollection.insertMany(
                        [
                            {
                                '_id' : new ObjectID('5249c43c6e789470197b5974'),
                                'themeId': '5249c43c6e789470197b5973',
                                'name': 'Déchèteries',
                                'description': 'Déchèteries, centres de tri, etc.',
                                'overpassRequest': "(node['amenity'='recycling']['recycling_type'='centre']({{bbox}});relation['amenity'='recycling']['recycling_type'='centre']({{bbox}});way['amenity'='recycling']['recycling_type'='centre']({{bbox}}));out body center;>;out skel;",
                                'minZoom': 14,
                                'popupContent': '# Nom : {name}\n\n_Amenity :_ {amenity}',
                                'order': 0,
                                'markerShape': 'marker1',
                                'markerColor': 'green',
                                'markerIcon': 'recycle',
                            },
                            {
                                '_id' : new ObjectID('5249c43c6e789470197b5975'),
                                'themeId': '5249c43c6e789470197b5973',
                                'name': 'Poubelles',
                                'description': 'Poubelles de toutes sortes',
                                'overpassRequest': "(node['amenity'='waste_basket']({{bbox}});relation['amenity'='waste_basket']({{bbox}});way['amenity'='waste_basket']({{bbox}}));out body center;>;out skel;",
                                'minZoom': 14,
                                'popupContent': '# Nom : {name}\n\n_Amenity :_ {amenity}',
                                'order': 1,
                                'markerShape': 'marker1',
                                'markerColor': 'yellow',
                                'markerIcon': 'trash',
                            }
                        ],
                        {'safe': true},
                        dummyPromiseCallback.bind(this, resolve, reject)
                    );
                });
            }),
            new Promise((resolve, reject) => {
                this._db.createCollection('user', (err, collection) => {
                    this._userCollection = collection;

                    resolve();
                });
            }),
        ];

        return Promise.all(insertPromises)
        .then(() => {
            console.log('Database fulfilled');
        })
        .catch(err => {
            throw err;
        });
    }

    createIndexes () {
        let indexesPromises = [
            new Promise((resolve, reject) => {
                this._userCollection.createIndex(
                    { 'osmId': 1 },
                    { 'unique': true },
                    dummyPromiseCallback.bind(this, resolve, reject)
                );
            }),
            new Promise((resolve, reject) => {
                this._themeCollection.createIndex(
                    { 'fragment': 1 },
                    { 'unique': true },
                    dummyPromiseCallback.bind(this, resolve, reject)
                );
            }),
            new Promise((resolve, reject) => {
                this._layerCollection.createIndex(
                    { 'themeId': 1 },
                    dummyPromiseCallback.bind(this, resolve, reject)
                );
            }),
        ];

        return Promise.all(indexesPromises)
        .then(() => {
            console.log('Collections\' indexes created');
        })
        .catch(err => {
            throw err;
        });
    }
}
