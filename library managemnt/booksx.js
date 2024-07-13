const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const pool = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

const validateBooks = (book) =>{
    const {id , Name ,Author,ISSN, Publisher, quantity} = book;
    if(!id || !Name || !Author || !ISSN || !Publisher || !quantity){
        return 'All fields required';
    }
    return null;
}

app.post('/books',async(req,res)=>{
    const error = validateBooks(req.body);
    if(error){
        return res.status(400).json({error});
    }
    const {id , Name ,Author, ISSN, Publisher, quantity} = req.body;

    try{
        const result = await pool.query(
            'INSERT INTO books (id, Name, Author, Publisher, ISSN, quantity) VALUES($1,$2,$3,$4,$5,$6) RETURNING *',
            [id , Name ,Author,ISSN, Publisher, quantity]
        );
        return res.status(200).json({message:'Book added successfully', data: result.rows[0]});
    }catch(err){
        if(err.code==='23505'){
            return res.status(409).json({error: 'Book with this number already exists'});
        }else{
            console.error(err);
            return res.status(500).json({error:err.message});
        }
    }

});

app.get('/books',async(req,res)=>{
    try{
        const result = await pool.query('SELECT * FROM books');
        console.log(result.rows);
        return res.json({data: result.rows});
    }catch(err){
        console.error(err);
        res.status(500).json({error: err.message});
    }

});

app.put('/books/:id',async(req,res)=>{
    const {id} = req.params;
    const error = validateBooks(req.body);

    if(error){
        return res.status(400).json({error});
    }

    const {Name, Author, Publisher,ISSN,quantity} = req.body;
    try{
        const result  = await pool.query(
            'UPDATE students SET Name = $1, Author = $2, Publisher = $3, ISSN = $4, quantity = $5 WHERE id = $6 RETURNING *',
            [Name, Author, Publisher, ISSN,quantity, id]

        );

        if(result.rowCount===0){
            return res.status(404).json({error: 'No book was updated'});
        }

        return res.status(200).json({message:'Book updated successfully', data: result.rows[0]});
    }catch (err){
        console.error(err);
        return res.status(500).json({error:'Internal Server Error'});
    }
});

app.delete('/books/:id', async(req,res)=>{
    const {id }= req.params;
    try{
        const result = await pool.query('DELETE FROM books WHERE id = $1 RETURNING *',[id]);
        if(result.rowCount===0){
            return res.status(404).json({error:'Book not found'});
        }
        return res.json({message:'Book deleted successfully',data:result.rows[0]});
    }catch(err){
        console.error(err);
        res.status(500).json({error:'Internal server error'});
    }

});


app.listen(PORT, ()=>{
    console.log(`Server is running on http://localhost:${PORT}`)
});