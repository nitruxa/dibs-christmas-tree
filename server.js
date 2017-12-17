import http from 'http';
import express from 'express';
import bodyParser from 'body-parser';
import readTasks from './helpers/readTasks';
import { startTask, stopTask } from './helpers/runTask';
import sendToTelnet from './helpers/sendToTelnet';

const APP_PORT = 5000;
let taskList = [];
let activeTask = null;

readTasks()
    .then(tasks => {
        taskList = tasks;
        sendToTelnet(0);
    })
    .catch(error => {
        throw new Error(error);
    });



const app = express();
http.Server(app); // eslint-disable-line

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/animations', (req, res) => {
    res.status(200).json(taskList);
});

app.get('/start-animation', (req, res) => {
    const search = req.query.search;

    if (search) {
        const task = taskList.find(({ name }) => name.toLowerCase().includes(search.toLowerCase()));
        activeTask = task;

        if (!task) {
            res.status(404).json({ error: `Animation with search "${search}" was not found` });
        }
    }

    if (activeTask) {
        startTask(activeTask, stripValues => {
            sendToTelnet(stripValues);
        });
        res.status(200).json({ message: `Successfully started "${activeTask.name}" animation` });
    }
});

app.get('/stop-animation', (req, res) => {
    stopTask();
    res.status(200).json({ status: 'OK' });
});

app.get('/turn-on', (req, res) => {
    stopTask();
    sendToTelnet(100);
    res.status(200).json({ status: 'OK' });
});

app.get('/turn-off', (req, res) => {
    stopTask();
    sendToTelnet(0);
    res.status(200).json({ status: 'OK' });
});

app.use('*', (req, res) => {
    res.status(404).json({ error: 'Page not found' });
});

app.listen(APP_PORT, function (err) {
    if (err) {
        console.log(err);
        return;
    }

    console.log(`Listening at http://127.0.0.1:${APP_PORT}`);
});
