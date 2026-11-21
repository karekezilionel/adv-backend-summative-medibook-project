const fs = require('fs');
const path = require('path');

const getFeedbackPage = (req, res) => {
    let lang = req.query.lang || 'en';
    
    const supportedLangs = ['en', 'fr'];
    if (!supportedLangs.includes(lang)) {
        lang = 'en';
    }

    const localePath = path.join(__dirname, `../../locales/${lang}.json`);
    const localeData = JSON.parse(fs.readFileSync(localePath, 'utf8'));

    const today = new Date();
    const formattedDate = new Intl.DateTimeFormat(lang, { dateStyle: 'full' }).format(today);

    const html = `
        <!DOCTYPE html>
        <html lang="${lang}">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${localeData.title}</title>
            <style>
                body { font-family: sans-serif; max-width: 700px; margin: 40px auto; padding: 20px; line-height: 1.6; }
                .qa-block { margin-bottom: 30px; background: #f9f9f9; padding: 15px; border-left: 4px solid #007bff; }
                label { font-weight: bold; display: block; margin-bottom: 5px; color: #333; font-size: 1.1em; }
                p { margin: 10px 0 0 0; color: #555; font-size: 1em; }
                .header { margin-bottom: 30px; border-bottom: 1px solid #ccc; padding-bottom: 20px; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>${localeData.title}</h1>
                <p>${localeData.instructions}</p>
                <p><strong>${localeData.date}:</strong> ${formattedDate}</p>
            </div>
            
            <div class="qa-block">
                <label>${localeData.q1}</label>
                <p>${localeData.a1}</p>
            </div>
            <div class="qa-block">
                <label>${localeData.q2}</label>
                <p>${localeData.a2}</p>
            </div>
            <div class="qa-block">
                <label>${localeData.q3}</label>
                <p>${localeData.a3}</p>
            </div>
            <div class="qa-block">
                <label>${localeData.q4}</label>
                <p>${localeData.a4}</p>
            </div>
            <div class="qa-block">
                <label>${localeData.q5}</label>
                <p>${localeData.a5}</p>
            </div>
        </body>
        </html>
    `;

    res.send(html);
};

module.exports = { getFeedbackPage };