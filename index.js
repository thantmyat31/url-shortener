const express = require('express');
const yup = require('yup');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const { static } = require('express');
const { nanoid } = require('nanoid');
const monk = require('monk');

require('dotenv').config();
const db = monk(process.env.MONGO_URI);
const urls = db.get('urls');
urls.createIndex({ slug: 1 }, { unique: true });

const app = express();

app.use(morgan('tiny'));
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(static('./public'));

const schema = yup.object().shape({
    slug: yup.string().trim().matches(/[\w\-\_]/i),
    url: yup.string().trim().url().required(),
});

// app.get('/url/:id', (req, res) => {
//     // get short url by id
// });

app.get('/:id', async (req, res) => {
    const { id: slug } = req.params;
    try {
        const url = await urls.findOne({ slug });
        if(url) {
            res.redirect(url.url);
        } else {
            res.redirect(`/?error=${slug} not found`);
        }
    } catch(error ) {
        res.redirect(`/?error=Link not found`);
    }
});

app.get('/getall/getall', async(req, res, next) => {
    try {
        const getall = await urls.find();
        res.json(getall);
    } catch(error) {
        next(error);
    }
})

app.post('/url', async (req, res, next) => {
    let { slug, url } = req.body;
    
    try {
        await schema.validate({
            slug,
            url
        });
        if(!slug) {
            slug = nanoid(5);
        } else {
            const existing = await urls.findOne({ slug });
            if(existing) {
                throw new Error('Slug in use');
            }
        }
        slug = slug.toLowerCase();

        const newUrl = {
            slug,
            url,
        }
        const created = await urls.insert(newUrl);
        res.json(created);
    } catch(error) {
        next(error);
    }
});

app.use((error, req, res, next) => {
    if(error.status) {
        res.status(error.status)
    } else {
        res.status(500);
    }
    res.json({
        message: error.message,
        stack: process.env.NODE_ENV === 'production' ? '@-@' : error.stack,
    })
})

const PORT = process.env.PORT || 2020;

app.listen(PORT, () => console.log(`Listening at PORT: ${PORT}`))