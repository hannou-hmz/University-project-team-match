const database = require('./db');

async function getCategories(){

    try{
        const sql = "SELECT category_id, category_name , category_description , created_at FROM categories WHERE is_active = 1";
        const [result] = await database.pool.execute(sql);
        return result;
    }

    catch(e){;
        throw e;
    }
}

async function deleteCategory(id){
    try{
        const sql = "DELETE FROM categories WHERE category_id = ?";
        const [result] = await database.pool.execute(sql , [id]); 
        console.log('Deletion successefully..');
    }

    catch(e){
        throw e;
    }
}

async function addCategory(name, description){

    try{
        const sql = "INSERT INTO categories (category_name , category_description) VALUES(?,?)";
        const[result] = await database.pool.execute(sql , [name , description]);
        return result;
        console.log(`Inserted successefully ..`);
    }

    catch(e){
        throw e;
    }
}

async function updateCategory(id , name,  description){
    try{
        const sql = "UPDATE categories SET category_name = ? , category_description = ? WHERE category_id = ?";
        const [result] = await database.pool.execute(sql , [name , description , id]);
        if(result.affectedRows < 0){
            throw Error(`Update categories failed !`);
        }

        console.log(`Updated successefully ..`);
        return result;     
    }catch(e){
        throw e;
    }
}

module.exports = {
    getCategories,
    addCategory,
    deleteCategory,
    updateCategory
}