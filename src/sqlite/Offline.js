import Database from "tauri-plugin-sql-api";


const searchKeyWord = async (keyword, almacen) => {
    const db = await initializeDatabase();
    const query = `
        SELECT 
            products.*, 
            precios.precio as precio 
        FROM 
            products 
        LEFT JOIN 
            precios ON products.id = precios.product_id 
        WHERE 
            precios.almacen_id = ? 
            AND REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(name, 'á', 'a'), 'é', 'e'), 'í', 'i'), 'ó', 'o'), 'ú', 'u') 
            LIKE REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(?, 'á', 'a'), 'é', 'e'), 'í', 'i'), 'ó', 'o'), 'ú', 'u')
        LIMIT 150;

   `;
    return await db.select(query, [almacen, `%${keyword}%`]);
}
const searchCode = async (keyword, almacen) => {
    const db = await initializeDatabase();
    const query = `
        SELECT * FROM products LEFT JOIN precios ON products.id = precios.product_id WHERE precios.almacen_id = ? AND codigo like ? LIMIT 1
   `;
    return await db.select(query, [almacen, `${keyword}`]);
}
const getProductById = async (id, almacen) => {
    const db = await initializeDatabase();
    const query = `
        SELECT products.*, precios.precio FROM products LEFT JOIN precios ON products.id = precios.product_id WHERE products.id = ? LIMIT 1
   `;
    const product = await db.select(query, [id]);
    if (product.length) {
        return product[0]
    }
    return null
}
const enviarArticulo = async (product, name, ticket, pventa, cantidad) => {
    const db = await initializeDatabase();
    const importe = pventa * cantidad;
    const has = `
        SELECT * FROM articulos WHERE ticket_id = $1 AND product_id = $2  
   `;
    let hasResult = await db.select(has, [ticket, product]);

    if (hasResult.length > 0) {
        hasResult = hasResult[0];
        const update = `UPDATE articulos SET cantidad = $1, precio = $2,importe =$3 WHERE id= $4`
        const newCantidad = +hasResult.cantidad + +cantidad;
        return await db.execute(update, [newCantidad, pventa, newCantidad * pventa, hasResult.id]);
    }
    const query = `
        INSERT into articulos (ticket_id, product_id,name,precio,importe,cantidad) VALUES ($1, $2, $3, $4, $5, $6)
   `;
    return await db.execute(query, [ticket, product, name, pventa, importe, cantidad]);
}
const getAllPendientes = async (userId, orgId) => {
    const db = await initializeDatabase();
    const query = `
        SELECT * FROM tickets 
        LEFT JOIN almacens ON tickets.almacen_id = almacens.id 
        WHERE tickets.organization_id = $1 
        AND tickets.user_id = $2 
        AND tickets.esta_abierto = 1 
        AND tickets.pendiente = 1 
        LIMIT 1
   `;
    const response = await db.select(query, [orgId, userId]);
    if (response.length > 0) {
        return response;
    }
    return null;
}
const getSpecificVT = async (ticket) => {
    const db = await initializeDatabase();
    const query = `
        SELECT t.*, almacens.name, clientes.name as c_name
        FROM tickets as t
        LEFT JOIN almacens ON t.almacen_id = almacens.id 
        LEFT JOIN clientes ON t.cliente_id = clientes.id 
        WHERE t.id = $1 
        LIMIT 1
   `;
    const response = await db.select(query, [ticket]);
    if (response.length > 0) {
        return response[0];
    }
    return null;
}
const initTicket = async (orgId, userId) => {
    const db = await initializeDatabase();
    const query = `
        SELECT t.*, almacens.name, clientes.name as c_name
        FROM tickets as t 
        LEFT JOIN almacens ON t.almacen_id = almacens.id 
        LEFT JOIN clientes ON t.cliente_id = clientes.id 
        WHERE t.esta_abierto = $1 AND t.organization_id = $2 AND t.pendiente = $3 AND t.user_id = $4 LIMIT 1
   `;
    const response = await db.select(query, [1, orgId, 0, userId]);
    if (response.length > 0) {
        return response[0];
    }
    const createTicket = `
        INSERT into tickets (organization_id, user_id, almacen_id) VALUES ($1,$2,$3)
   `;
    const lastInserted = await db.execute(createTicket, [orgId, userId]);
    const getLast = `
        SELECT * FROM tickets WHERE id = $1 LIMIT 1
   `;
    const res = await db.select(getLast, [lastInserted.lastInsertId]);
    return res[0];
}
const updateArticulo = async (articulo, cantidad, precio) => {
    const db = await initializeDatabase();
    const importe = +cantidad * +precio;
    const query = `UPDATE articulos SET cantidad = $1, precio= $2, importe=$3 WHERE id= $4`
    return await db.execute(query, [cantidad, precio, importe, articulo]);
}
const destroyArticulo = async (articulo) => {
    const db = await initializeDatabase();
    const query = `
        DELETE FROM articulos WHERE id = $1 
   `;
    const response = await db.execute(query, [articulo]);
    return response;

}
const setPendiente = async (ticket) => {
    const db = await initializeDatabase();
    const query = `UPDATE tickets SET pendiente = 1 WHERE id= $1`
    return await db.execute(query, [ticket]);
}
const guardarVenta = async (total, ticket, pago_con, credito) => {
    const db = await initializeDatabase();
    const query = `
    UPDATE tickets 
    SET esta_abierto = 0, total= $1, pagado_en=datetime('now', 'localtime'), pago_con=$3, credito=$4  
    WHERE id= $2`
    return await db.execute(query, [total, ticket, pago_con, credito]);
}
const borrarTicket = async (ticket) => {
    const db = await initializeDatabase();
    const query = `
        DELETE FROM tickets WHERE id = $1 
   `;
    const response = await db.execute(query, [ticket]);
    return response;

}
const getClients = async (ticket) => {
    const db = await initializeDatabase();
    const query = `
        SELECT * 
         FROM clientes 
         ORDER BY name DESC
   `;
    const response = await db.select(query, [ticket]);
    return response;
}
const getArticulos = async (ticket) => {
    const db = await initializeDatabase();
    const query = `
        SELECT articulos.*, products.name as name, products.codigo as codigo
         FROM articulos 
         LEFT JOIN products ON products.id = articulos.product_id 
         WHERE ticket_id = $1 
         ORDER BY articulos.id DESC
   `;
    const response = await db.select(query, [ticket]);
    return response;
}
const getMisVentas = async (userId) => {
    const db = await initializeDatabase();
    const query = `
        SELECT tickets.*, almacens.name as name, clientes.name as cliente_name 
         FROM tickets 
         LEFT JOIN almacens ON tickets.almacen_id = almacens.id 
         LEFT JOIN clientes ON tickets.cliente_id = clientes.id 
         WHERE tickets.user_id = $1 
         AND tickets.esta_abierto = 0
         ORDER BY tickets.id DESC
   `;
    const response = await db.select(query, [userId]);
    return response;
}
const getVentasForSync = async (userId) => {
    const db = await initializeDatabase();
    const query = `
        SELECT *
         FROM tickets 
         WHERE tickets.user_id = $1 
         AND tickets.esta_abierto = 0
         LIMIT 5
   `;
    const response = await db.select(query, [userId]);
    return response;
}
const getArticulosForSync = async (values) => {
    const db = await initializeDatabase();
    // Create a comma-separated list of placeholders for the values array
    const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');

    // Construct the query with the IN clause
    const query = `
      SELECT *
      FROM articulos
      WHERE ticket_id IN (${placeholders})
    `;

    // Execute the query with the values array
    const response = await db.select(query, values);

    return response;
};
const setCliente = async (cliente, ticket) => {
    const db = await initializeDatabase();
    const query = `UPDATE tickets SET cliente_id = $1 WHERE id= $2`
    return await db.execute(query, [cliente, ticket]);
}
const setNombreTicket = async (nombre, ticket) => {
    const db = await initializeDatabase();
    const query = `UPDATE tickets SET nombre = $1 WHERE id= $2`
    return await db.execute(query, [nombre, ticket]);
}

const asignarAlmacen = async (ticket, almacen) => {
    const db = await initializeDatabase();
    const query = `UPDATE tickets SET almacen_id = $1 WHERE id= $2`
    return await db.execute(query, [almacen, ticket]);
}

async function initializeDatabase() {
    return await Database.load("sqlite:daventas.db");
}
export default {
    searchKeyWord,
    searchCode,
    enviarArticulo,
    getSpecificVT,
    initTicket,
    getArticulos,
    asignarAlmacen,
    destroyArticulo,
    getProductById,
    updateArticulo,
    borrarTicket,
    guardarVenta,
    setPendiente,
    getAllPendientes,
    getMisVentas,
    getVentasForSync,
    getArticulosForSync,
    getClients,
    setCliente,
    setNombreTicket,
}