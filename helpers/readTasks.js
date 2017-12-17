import fs from 'fs';
import path from 'path';

function readTask(filename) {
    return new Promise((resolve, reject) => {
        fs.readFile(path.resolve(__dirname, `../data/${filename}`), 'utf8', (error, data) => {
            if (error) {
                reject(error);
            }

            return resolve(JSON.parse(data));
        });
    });
}

function readTasks() {
    return new Promise((resolve, reject) => {
        fs.readdir(path.resolve(__dirname, `../data`), async (error, files) => {
            if (error) {
                reject(error);
            }

            const tasks = await Promise.all(
                files.map(async file => {
                    const task = await readTask(file);
                    return task;
                })
            );

            resolve(tasks);
        });
    });
}

export default readTasks;
