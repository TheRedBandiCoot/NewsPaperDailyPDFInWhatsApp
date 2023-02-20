// //*  Working Code
const venom = require('venom-bot');
const { JSDOM } = require('jsdom');
const https = require('https');
const cron = require('node-cron');

const url = 'https://www.careerswave.in/ei-samay-epaper-pdf/';

// Schedule the task to run every day at 7 am
cron.schedule('10 4 * * *', () => {
  https
    .get(url, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        const { document } = new JSDOM(data).window;
        let driveLink = document.querySelector('.nt_row_id_0 td:nth-of-type(2)').textContent.trim();
        let driveLinkDate = document.querySelector('.nt_row_id_0 td:nth-of-type(1)').textContent;
        // Extract file ID from Google Drive link
        let fileId = driveLink.match(/[-\w]{25,}/);
        if (!fileId) {
          console.error('Invalid Google Drive link');
          return;
        }
        fileId = fileId[0];

        // Send the file as a stream to the WhatsApp chat
        venom
          .create()
          .then((client) => {
            let driveUrl = `https://drive.google.com/uc?id=${fileId}`;
            client
              .sendFile(
                '918697857602@c.us',
                driveUrl,
                /*`PDF file: ${driveLink}`,*/ `Ei Samay`,
                `Today's NewsPaper: ${driveLinkDate}`
              )
              .then((result) => {
                console.log('File sent: ', result);
              })
              .catch((error) => {
                console.error('Error sending file: ', error);
              });
          })
          .catch((err) => {
            console.error(err);
          });
      });
    })
    .on('error', (err) => {
      console.error('Error fetching link: ', err);
    });
});
