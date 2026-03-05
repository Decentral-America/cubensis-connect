import https from 'node:https';
import fs from 'node:fs';
import { readFileSync } from 'node:fs';

let lokaliseApiKey;

try {
  const private_config = JSON.parse(
    readFileSync(new URL('../config.json', import.meta.url), 'utf8'),
  );
  lokaliseApiKey = private_config.lokaliseApiKey;
} catch {
  lokaliseApiKey = null;
}

const options = {
  method: 'POST',
  url: 'https://api.lokalise.co/api2/projects/4893596861fd002134ed48.07242588/files/download',
  headers: {
    'x-api-token': lokaliseApiKey,
    'content-type': 'application/json',
  },
  body: { format: 'json', original_filenames: true },
  json: true,
};

function getLocales(locales = [], path = './') {
  if (!lokaliseApiKey) {
    console.error('\n\x1b[31mNo exist localise api key!!!\n');
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    function onError(error) {
      console.error('\n\x1b[31mDownload lokalise error', error, '\n');
      resolve();
    }

    function onDone() {
      console.log('\n\x1b[92mDownload lokalise done...', '\n');
      resolve();
    }

    const url = new URL(options.url);
    const reqOptions = {
      method: options.method,
      hostname: url.hostname,
      path: url.pathname,
      headers: {
        ...options.headers,
      },
    };
    const postData = JSON.stringify(options.body);
    reqOptions.headers['content-length'] = Buffer.byteLength(postData);

    const req = https.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const body = JSON.parse(data);
          const { bundle_url } = body;
          getFile(bundle_url, locales, path).then(onDone).catch(onError);
        } catch (e) {
          onError(e);
        }
      });
    });
    req.on('error', onError);
    req.write(postData);
    req.end();
  });
}

function getFile(url, locales, path) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, async (res) => {
      try {
        await unzipFile(res, locales, path);
        resolve();
      } catch (e) {
        reject(e);
      }
    });
    request.on('error', reject);
  });
}

async function unzipFile(response, locales, path) {
  const unZipper = (await import('unzipper')).default;
  return (
    response &&
    response.pipe(unZipper.Parse()).on('entry', function (entry) {
      const fileName = entry.path;
      const type = entry.type; // 'Directory' or 'File'

      const existLocales = locales.filter((lang) => fileName.includes(`${lang}/`));

      if (!existLocales.length) {
        console.warn('[skip lang]', fileName);
        return entry;
      }

      if (type === 'Directory') {
        const name = `${path}/${fileName}`;

        if (!fs.existsSync(name)) {
          fs.mkdirSync(name);
        }

        return entry;
      }

      console.log('[get lang]', fileName);
      return entry.pipe(fs.createWriteStream(`${path}/${fileName}`));
    })
  );
}

export default getLocales;
