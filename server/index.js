'use strict';

const express = require('express');
const path = require('path');
const cors = require('cors');
const crypto = require('crypto');
const cookieParser = require('cookie-parser');
const app = express();

const corsOptions = {
    origin: 'http://localhost:8080',
    credentials: true
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '..', 'public')));

function uuid() {
    return crypto.randomUUID();
}

const users = {
    'admin@mail.ru': {
        email: 'admin@mail.ru',
        password: 'password'
    }
};

const ids = {};

app.use((req, res, next) => {
    const token = req.cookies.podvorot;
    if (token && ids[token]) {
        req.user = users[ids[token]];
    }
    next();
});

app.post('/signup', (req, res) => {
    const { password, email } = req.body;
    
    if (!password || !email || !password.match(/^\S{4,}$/) || !email.match(/@/)) {
        return res.status(400).json({ error: 'Невалидные данные пользователя' });
    }
    
    if (users[email]) {
        return res.status(400).json({ error: 'Пользователь уже существует' });
    }

    const id = uuid();
    users[email] = { password, email };
    ids[id] = email;

    res.cookie('podvorot', id, {
        expires: new Date(Date.now() + 1000 * 60 * 10),
        httpOnly: true
    });
    res.status(201).json({ id, email });
});

app.post('/login', (req, res) => {
    const { password, email } = req.body;
    
    if (!password || !email) {
        return res.status(400).json({ error: 'Не указан E-Mail или пароль' });
    }
    
    if (!users[email] || users[email].password !== password) {
        return res.status(400).json({ error: 'Неверный E-Mail и/или пароль' });
    }

    const id = uuid();
    ids[id] = email;

    res.cookie('podvorot', id, {
        expires: new Date(Date.now() + 1000 * 60 * 10),
        httpOnly: true
    });
    res.status(200).json({ id, email });
});

app.post('/logout', (req, res) => {
    const token = req.cookies.podvorot;
    if (token) {
        delete ids[token];
    }
    res.clearCookie('podvorot');
    res.status(200).json({ message: 'Выход выполнен успешно' });
});

app.get('/me', (req, res) => {
    if (req.user) {
        res.json({ email: req.user.email });
    } else {
        res.status(401).json({ error: 'Не авторизован' });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});