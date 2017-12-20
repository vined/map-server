let express = require('express'),
    app = express(),
    port = 8081;

const {Client} = require('pg');
const connectionString = 'postgresql://mapserver:mapserver@db:5432/mapserver';


app.get('/airport-noise', function (req, res) {

    const client = new Client({connectionString: connectionString});
    client.connect();

    let fr = req.query.fr,
        to = req.query.to,
        sql = 'select ST_AsGeoJSON(geom) as shape, triuksm from noise_3857',
        filter = '';

    if (fr || to) {
        sql += ' where ';
    }

    if (fr) {
        filter += 'noise_from > ' + fr;
    }
    if (to) {
        if (filter.length > 0) filter += ' and ';
        filter += 'noise_to < ' + to;
    }
    sql += filter;

    // let sql = 'select ST_AsGeoJSON(geom) as shape, triuksm from noise_3857 where triuksm like \'90-%\'';
    // let sql = 'select ST_AsGeoJSON(ST_Transform(geom, 4326)) as shape from airport_noise where triuksm like \'90-%\'';
    // sql = sql + 'where geog && ST_GeogFromText(\'SRID=4326;POLYGON(($1 $2,$3 $4,$5 $6,$7 $8,$9 $10))\') ';
    // sql = sql + 'and ST_Intersects(geog, ST_GeogFromText(\'SRID=4326;POLYGON(($11 $12,$13 $14,$15 $16,$17 $18,$19 $20))\'));';

    console.log(sql);

    let vals = [];
    // let vals = [bounds._southWest.lng, bounds._southWest.lat, bounds._northEast.lng, bounds._southWest.lat, bounds._northEast.lng, bounds._northEast.lat, bounds._southWest.lng, bounds._northEast.lat, bounds._southWest.lng, bounds._southWest.lat];
    // vals = vals.concat(vals);

    client.query(sql, vals, (err, result) => {
        res.send({
            'type': 'FeatureCollection',
            'features': result.rows ? result.rows.map((row) => {
                let shape = JSON.parse(row.shape);
                shape = Object.assign(shape, {level: row.triuksm});
                return shape;
            }) : [],
        });
    });
});


app.use(express.static(__dirname + '/public'));
app.listen(port);
