const fs = require('fs');
const path = require('path');

const getFeedbackPage = (req, res) => {
    // 1. Get language from query string, fallback to English
    let lang = req.query.lang || 'en';
    
    // 2. Validate language (fallback to English if not supported)
    const supportedLangs = ['en', 'fr'];
    if (!supportedLangs.includes(lang)) {
        lang = 'en';
    }

    // 3. Load the locale file
    const localePath = path.join(__dirname, `../../locales/${lang}.json`);
    const localeData = JSON.parse(fs.readFileSync(localePath, 'utf8'));

    // 4. Format today's date based on the locale
    const today = new Date();
    const formattedDate = new Intl.DateTimeFormat(lang, { 
        dateStyle: 'full' 
    }).format(today);

    // 5. Generate the HTML
    const html = `
        <!DOCTYPE html>
        <html lang="${lang}">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${localeData.title}</title>
            <style>
                body { font-family: sans-serif; max-width: 600px; margin: 40px auto; padding: 20px; }
                textarea { width: 100%; height: 80px; margin-bottom: 20px; }
                label { font-weight: bold; display: block; margin-bottom: 5px; }
                .header { margin-bottom: 30px; }
                button { padding: 10px 20px; background: #007bff; color: white; border: none; cursor: pointer; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>${localeData.title}</h1>
                <p>${localeData.instructions}</p>
                <p><strong>${localeData.date}:</strong> ${formattedDate}</p>
            </div>
            <form action="#" method="POST">
                <label>${localeData.q1}</label>
                <textarea name="q1" required></textarea>
                
                <label>${localeData.q2}</label>
                <textarea name="q2" required></textarea>
                
                <label>${localeData.q3}</label>
                <textarea name="q3" required></textarea>
                
                <label>${localeData.q4}</label>
                <textarea name="q4" required></textarea>
                
                <label>${localeData.q5}</label>
                <textarea name="q5" required></textarea>
                
                <button type="submit">${localeData.submit}</button>
            </form>
        </body>
        </html>
    `;

    res.send(html);
};

module.exports = { getFeedbackPage };