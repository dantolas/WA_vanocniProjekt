import {query} from '../functions/database.js'
import express from 'express'
import {checkIfAuthenticated} from '../functions/authentication.js'


const router = express.Router();


router.get('/api',checkIfAuthenticated,async(req,res)=>{
    res.status(200);
    res.sendFile('/api/api.html',{root:'views'});
})

router.get('/api/messages',async (req,res)=>{

    let sql = `
        select Message.message,Message.time_sent,sender.username as sender,receiver.username receiver
        from Message
        inner join User sender on sender.id = Message.sender_id
        inner join User receiver on receiver.id = Message.rec_id
        group by sender.username,receiver.username,message,time_sent
        order by sender,receiver,time_sent\G
        `;
    let rows = await query(sql);

    if(!rows || rows.length <= 0){
        res.status(200);
        res.set('Content-Type', 'application/json');
        let data = {message:"No posts present in database"};
        return res.send(JSON.stringify(data));
    }

 
    res.status(200);
    res.set('Content-Type', 'application/json');
    let messages = []
    for(let i = 0; i < rows.length; i++){
        let message = rows[i].message;
        let time_sent= rows[i].time_sent;
        let sender = rows[i].sender;
        let receiver = rows[i].receiver;
        let json = {'message':message,'sender':sender,'receiver':receiver,'time_sent':time_sent}
        messages.push(json);
    }
    
    return res.send(JSON.stringify(data));
 
})

router.get('/api/messagesUser',async (req,res) =>{

    console.log("Api user messages query params:"+req.query.id);

    if(!req.query.user){
        return res.send("Send a user parameter with your query containing username or email");
    }

    let id;

    let rows;
    try {

        let sql = `
select Message.message,Message.time_sent,sender.username as sender,receiver.username receiver
from Message
inner join User sender on sender.id = Message.sender_id
inner join User receiver on receiver.id = Message.rec_id
group by sender.username,receiver.username,message,time_sent
order by sender,receiver,time_sent\G
`;
        rows = await query(sql)
    } catch (error) {
        console.log(error);
        return res.send("Error during SQL query.");
    }

    if(!rows ||rows.length == 0){
        res.status(200);
        res.set('Content-Type', 'application/json');
        let data = {posts:[]};
        return res.send(JSON.stringify(data));
    }
     
    res.status(200);
    res.set('Content-Type', 'application/json');
    let data = {posts:[]}
    
    let author = rows[0].author;
    let title = rows[0].title;
    let content = rows[0].content;
    let date = rows[0].date;
    let post = {'author':author,'title':title,'content':content,'date':date}
    data.posts.push(post);

    
    return res.send(JSON.stringify(data));
})
 

router.post('/api/messagesGroup',checkIfAuthenticated,async (req,res) =>{

    let body = req.body;
    console.log(req.session.user)

    try{
        body = JSON.parse(req.body);
    }catch(e){

    }

    console.log(body);
    
    
    if(!body || !body.title || !body.content){
        return res.send("You must send a JSON object as the body of your request. Use this format: {title:<text>,content:<text>}");
    }

    let rows;
    let userId = req.session.user["id"];
    console.log(userId);

    

    try{
       rows = await query('INSERT INTO Post(author,title,content,date) values (?,?,?,NOW());',[userId,body.title,body.content]);
    }catch(e){
        console.log(e);
        return res.send("Error in SQL query, either the author with this ID does not exist, or your title or content were too long.");   
    }

    try {
        rows = await query('SELECT MAX(id) as id from Post;');
    } catch (error) {
        console.log(error);
    }

    if(!rows){
        return res.send("No post id returned after insert.");
    }

    console.log(rows);

    let response = {Request:"Success", idOfPost:rows[0].id};
    return res.send(JSON.stringify(response));
})


router.post('/api/messagesWord',checkIfAuthenticated,async (req,res) =>{

    let body = req.body;
    console.log(req.session.user)

    try{
        body = JSON.parse(req.body);
    }catch(e){

    }

    console.log(body);
    
    
    if(!body || !body.title || !body.content){
        return res.send("You must send a JSON object as the body of your request. Use this format: {title:<text>,content:<text>}");
    }

    let rows;
    let userId = req.session.user["id"];
    console.log(userId);

    

    try{
       rows = await query('INSERT INTO Post(author,title,content,date) values (?,?,?,NOW());',[userId,body.title,body.content]);
    }catch(e){
        console.log(e);
        return res.send("Error in SQL query, either the author with this ID does not exist, or your title or content were too long.");   
    }

    try {
        rows = await query('SELECT MAX(id) as id from Post;');
    } catch (error) {
        console.log(error);
    }

    if(!rows){
        return res.send("No post id returned after insert.");
    }

    console.log(rows);

    let response = {Request:"Success", idOfPost:rows[0].id};
    return res.send(JSON.stringify(response));
})

export default router;
