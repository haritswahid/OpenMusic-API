const fs = require('fs');

class StorageService {
  constructor(folder) {
    this.folder = folder;

    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }
  }

  // eslint-disable-next-line class-methods-use-this
  generateName(meta) {
    return +new Date() + meta.filename;
  }

  writeFile(file, filename) {
    const path = `${this.folder}/${filename}`;

    const fileStream = fs.createWriteStream(path);

    return new Promise((resolve, reject) => {
      fileStream.on('error', (error) => reject(error));
      file.pipe(fileStream);
      file.on('end', () => resolve(filename));
    });
  }
}

module.exports = StorageService;
