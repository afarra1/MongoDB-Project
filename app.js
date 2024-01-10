const express = require("express");
const path = require("path");
const bcrypt = require("bcrypt"); 
const LogInCollection = require("./mongo");
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// const templatePath = path.join(__dirname, '../templates');
const publicPath = path.join(__dirname, '../public');
console.log(publicPath);

app.set('view engine', 'html');
// app.set('views', templatePath);
app.use(express.static(publicPath));

app.get('/signup', (req, res) => {
    res.render('signup');
});

app.get('/', (req, res) => {
    res.sendFile('index');
});

app.post('/signup', async (req, res) => {
    const { name, password } = req.body;
    
    try {
        const existingUser = await LogInCollection.findOne({ name });

        if (existingUser) {
            return res.send("User details already exist");
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await LogInCollection.create({ name, password: hashedPassword });

        res.status(201).redirect("/SocialFeed.html");
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

app.post('/login', async (req, res) => {
    const { name, password } = req.body;

    try {
        const user = await LogInCollection.findOne({ name });

        if (!user) {
            return res.send("User not found");
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (passwordMatch) {
            res.status(201).redirect("/home");
        } else {
            res.send("Incorrect password");
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

app.listen(port, () => {
    console.log('Server connected on port', port);
});
