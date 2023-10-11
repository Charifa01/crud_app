const express = require('express');
const router = express.Router();
const User = require('../models/users');
const multer = require('multer');
const fs = require('fs');


const storage = multer.diskStorage({
    destination : (req,file,cb)=>{
        cb(null, './uploads');
    },
    filename : (req,file,cb)=>{
        cb(null , `${file.originalname}`)
    }
})

const upload = multer({storage : storage}).single('image');

router.post('/add',upload ,async (req,res) =>{
    const user = new User({
        name : req.body.name,
        email : req.body.email,
        phone : req.body.phone,
        image : req.file.filename
    })
    await user.save()
    .then(()=>{
        req.session.message = {
        type: 'success',
        message: 'User added successfully!'
        }
    })
    .catch((err)=>{
        res.json({message: err.message, type: 'danger' });
    })
    res.redirect('/');
})

    router.get('/', async (req, res) => {
        try {
          const users = await User.find().exec();
           res.render('index', {
            title: 'Home Page',
            users: users,
            });
        } catch (err) {
            res.json({ message: err.message });
        }
});

router.get('/add',(req,res)=>{
    res.render('add_users',{title : 'Add user'})
})

router.get('/edit/:id',(req,res)=>{
    let id = req.params.id;
    User.findById(id)
    .then((user)=>{
        if(user == null){
            res.redirect('/')
        }else{
            res.render('edit_user',{
                title : 'Edit User',
                user : user
            })
        }
    })
    .catch((err)=>{
        if(err){
            res.redirect('/')
        }
    })
})  
// update user route 
router.post('/update/:id', upload, async (req, res) => {
    let id = req.params.id;
    let new_image = '';

    if (req.file) {
        new_image = req.file.filename;
        try {
            fs.unlink(`/uploads/${req.body.old_image}`);
        } catch (err) {
            console.log(err);
        }
    } else {
        new_image = req.body.old_image;
    }

    try {
        await User.findByIdAndUpdate(id, {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            image: new_image
        });

        req.session.message = {
            type: 'success',
            message: 'The user was updated successfully!'
        };
    } catch (err) {
        req.session.message = {
            type: 'danger',
            message: 'There was an error, and the user was not updated :('
        };
    }

    res.redirect('/');
});

router.get('/delete/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const result = await User.findByIdAndDelete(id);

    if (!result) {
      req.session.message = {
        type: 'danger',
        message: 'User not found!'
      };
    } else {
      req.session.message = {
        type: 'info',
        message: 'The user was deleted successfully!'
      };
      if (result.image) {
        fs.unlink(`./uploads/${result.image}`, (err) => {
          if (err) {
            console.error('Error deleting user image:', err);
          } else {
            console.log('User image deleted successfully.');
          }
        });
      }
    }
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
});


module.exports = router ;