
import Backbone from 'backbone';
import config from 'config';
import userApi from './user';
import themeApi from './theme';
import fileApi from './file';
import ThemeModel from '../public/js/model/theme';



export default function Api(app, db, CONST, packageJson){
    let options = {
        'CONST': CONST,
        'database': db,
        'fileApi': fileApi,
    };

    userApi.setOptions( options );
    themeApi.setOptions( options );
    fileApi.setOptions( options );
    fileApi.initDirectories( app );


    app.get('/api/user/logout', userApi.Api.logout);
    // app.get('/api/user', userApi.Api.getAll);
    app.get('/api/user/:_id', userApi.Api.get);
    app.post('/api/user', isLoggedIn, userApi.Api.post);
    app.put('/api/user/:_id', isLoggedIn, userApi.Api.put);
    // app.delete('/api/user/:_id', isLoggedIn, userApi.Api.delete);

    app.get('/api/theme', themeApi.Api.getAll);
    app.get('/api/theme/:_id', themeApi.Api.get);
    app.post('/api/theme', isLoggedIn, themeApi.Api.post);
    app.put('/api/theme/:_id', isLoggedIn, themeApi.Api.put);
    // app.delete('/api/theme/:_id', isLoggedIn, themeApi.Api.delete);

    app.get('/', (req, res) => {
        let clientConfig = config.get('client');
        let templateVars = {
            'user': req.session.user ? JSON.stringify(req.session.user) : '{}',
            'config': JSON.stringify( clientConfig ),
            'highlightList': '[]',
            'version': packageJson.version,
        };

        if (clientConfig.highlightedThemes && clientConfig.highlightedThemes.length > 0) {
            let promises = [];

            for (let fragment of clientConfig.highlightedThemes) {
                promises.push(
                    themeApi.Api.findFromFragment(fragment)
                );
            }

            Promise.all(promises)
            .then((themeObjects) => {
                let highlightList = [];

                for (let themeObject of themeObjects) {
                    highlightList.push(themeObject);
                }

                templateVars.highlightList = JSON.stringify( highlightList );

                res.render('home', templateVars);
            })
            .catch( onPromiseError.bind(this, res) );
        }
        else {
            res.render('home', templateVars);
        }
    });

    app.get('/t/:fragment-*', (req, res) => {
        let templateVars = {
            'user': req.session.user ? JSON.stringify(req.session.user) : '{}',
            'config': JSON.stringify( config.get('client') ),
            'version': packageJson.version,
        };

        themeApi.Api.findFromFragment(req.params.fragment)
        .then(( themeObject ) => {
            templateVars.theme = JSON.stringify( themeObject );

            res.render('theme', templateVars);
        })
        .catch( onPromiseError.bind(this, res) );
    });


    app.get('/create_theme', (req, res) => {
        if (!req.session.user) {
            res.sendStatus(401);
        }

        let userId = req.session.user._id.toString();

        themeApi.Api.createTheme(req.session, userId)
        .then(theme => {
            Backbone.Relational.store.reset();

            let collection = options.database.collection('theme'),
            model = new ThemeModel(theme);

            res.redirect(
                model.buildPath()
            );
        })
        .catch( onPromiseError.bind(this, res) );
    });


    app.post('/api/file/shape', fileApi.Api.postShapeFile);
}



function isLoggedIn (req, res, next) {
    if ( req.isAuthenticated() ) {
        return next();
    }

    res.sendStatus(401);
}



function onPromiseError(res, errorCode) {
    res.sendStatus(errorCode);
}
