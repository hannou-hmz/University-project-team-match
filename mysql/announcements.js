const database = require('./db');

async function getAnnouncements(){
    try{
        const sql = "SELECT c.category_id ,c.category_name , a.announcement_id , a.title , a.description , a.created_at , a.is_urgent FROM announcements AS a INNER JOIN categories AS c ON a.category = c.category_id"
        const [result] = await database.pool.execute(sql);
        return result;
    }

    catch(e){
        throw e;
    }
}

async function addAnnouncement(category , title , description , isUrgent){
    try{
        const sql = "INSERT INTO announcements (category , title , description , is_urgent) VALUES(? , ? , ? , ?)";
        const [result] = await database.pool.execute(sql , [category , title , description , isUrgent ? 1 : 0]);
        console.log('Announcement stored in db✅');
    }
    catch(e){
        console.log(`Announmcment error: ${e.message}`);
        throw e;
    }
}

async function deleteAnnouncement(id){

    try{
        const sql = "DELETE FROM announcements WHERE announcement_id = ?";
        const [result] = await database.pool.execute(sql , [id]);

    }

    catch(e){
        throw e;
    }
}


module.exports = {
    addAnnouncement,
    getAnnouncements,
    deleteAnnouncement
}