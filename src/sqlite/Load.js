import Database from "tauri-plugin-sql-api";
// const db = await Database.load("sqlite:daventas.db");
const chunkSize = 1000; // Adjust this value based on your needs

async function initializeDatabase() {
    return await Database.load("sqlite:daventas.db");
}
const products = async (products) => {
    const db = await initializeDatabase();
    for (let i = 0; i < products.length; i += chunkSize) {
        const chunk = products.slice(i, i + chunkSize);
        try {
            const placeholders = chunk.map(() => "(?, ?, ?, ?,?,?)").join(", ");
            const values = chunk.flatMap((product) => [product.id, product.organization_id, product.name, product.codigo, product.tventa, product.pcosto]);

            const query = `INSERT into products (id,organization_id,name,codigo,tventa,pcosto) VALUES ${placeholders}`;
            await db.execute(query, values);

            console.log(`Inserted ${chunk.length} products successfully`);
        } catch (error) {
            alert(error);
            console.error('Error inserting products:', error);
        }
    }
}
const precios = async (precios) => {
    const db = await initializeDatabase();
    for (let i = 0; i < precios.length; i += chunkSize) {
        const chunk = precios.slice(i, i + chunkSize);
        try {
            const placeholders = chunk.map(() => "(?, ?, ?, ?)").join(", ");
            const values = chunk.flatMap((precio) => [precio.id, precio.product_id, precio.almacen_id, precio.precio]);

            const query = `INSERT into precios (id,product_id,almacen_id,precio) VALUES ${placeholders}`;
            await db.execute(query, values);

            console.log(`Inserted ${chunk.length} precios successfully`);
        } catch (error) {
            console.error('Error inserting precios:', error);
        }
    }
}
const almacens = async (almacens) => {
    const db = await initializeDatabase();
    for (let i = 0; i < almacens.length; i += chunkSize) {
        const chunk = almacens.slice(i, i + chunkSize);
        try {
            const placeholders = chunk.map(() => "(?, ?, ?)").join(", ");
            const values = chunk.flatMap((almacen) => [almacen.id, almacen.organization_id, almacen.name]);

            const query = `INSERT into almacens (id,organization_id,name) VALUES ${placeholders}`;
            await db.execute(query, values);

            console.log(`Inserted ${chunk.length} almacens successfully`);
        } catch (error) {
            console.error('Error inserting almacens:', error);
        }
    }
}
const clientes = async (clientes) => {
    const db = await initializeDatabase();
    for (let i = 0; i < clientes.length; i += chunkSize) {
        const chunk = clientes.slice(i, i + chunkSize);
        try {
            const placeholders = chunk.map(() => "(?, ?, ?)").join(", ");
            const values = chunk.flatMap((cliente) => [cliente.id, cliente.organization_id, cliente.name]);

            const query = `INSERT into clientes (id,organization_id,name) VALUES ${placeholders}`;
            await db.execute(query, values);

            console.log(`Inserted ${chunk.length} clientes successfully`);
        } catch (error) {
            console.error('Error inserting clientes:', error);
        }
    }
}
export default {
    products,
    precios,
    almacens,
    clientes,
}