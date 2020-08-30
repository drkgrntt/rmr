import { Client } from 'https://deno.land/x/postgres/mod.ts'
import { dbCreds } from '../config.ts'
import { QueryOptions } from './types.ts'


/**
 * Send an SQL query to the PG database
 * 
 * @param sql The SQL query string
 * @param args The associated arguments to go into the query string
 */
const query = async (sql: string, args: any[]) => {

  // Init client
  const client = new Client(dbCreds)

  try {

    // Connect to the client
    await client.connect()

    // Send the query
    return await client.query(sql, ...args)

  } catch (err) {
    throw err
  } finally {
    await client.end()
  }
}


/**
 * Buils an SQL query string and args array
 * 
 * @param table The table to query in the DB
 * @param conditions The "where" conditions for the query
 * @param options Additional options for the query
 */
const buildQuery = (table: string, conditions?: any, options?: QueryOptions): [string, string[]] => {

  // Set the columns to select
  let columns = '*'
  if (options && options.fields) {
    columns = options.fields.map((field: string) => `'${field}'`).join(', ')
  }

  let sql = `SELECT ${columns} FROM ${table}`
  const args = []

  let i = 1

  // Add conditions to the query
  if (conditions) {
    Object.keys(conditions).forEach((key) =>{
      sql = ` ${sql} ${i > 1 ? 'AND' : 'WHERE'} "${key}" = $${i++}`
      args.push(conditions[key])
    })
  }

  if (options && options.limit) {
    sql = `${sql} LIMIT $${i++}`
    args.push(options.limit.toString())
  }

  // Punctuate
  sql = `${sql};`

  return [sql, args]
}


/**
 * Initializes tables
 */
const init = async () => {

  let sql = "CREATE TABLE IF NOT EXISTS recruiters (id uuid PRIMARY KEY, name varchar(255), company varchar(255), city varchar(255), state varchar(255), country varchar(255));"
  await query(sql, [])
}


/**
 * Find all records from a table
 * 
 * @param table The table to query in the DB
 * @param conditions The "where" conditions for the query
 * @param options Additional options for the query
 */
const findAll = async (table: string, conditions?: any, options?: QueryOptions) => {

  const [sql, args] = buildQuery(table, conditions, options)
  const result = await query(sql, args)

  const records = result.rows.map(record => {

    const formattedRecord: any = {}
    result.rowDescription.columns.forEach((element, i) => {
      formattedRecord[element.name] = record[i]
    })

    return formattedRecord
  })

  return records
}


/**
 * Find one record from a table
 * 
 * @param table The table to query in the DB
 * @param conditions The "where" conditions for the query
 * @param options Additional options for the query
 */
const findOne = async (table: string, conditions?: any, options?: QueryOptions) => {

  const [sql, args] = buildQuery(table, conditions, { ...options, limit: 1 })
  const result = await query(sql, args)

  const records = result.rows.map(record => {

    const formattedRecord: any = {}
    result.rowDescription.columns.forEach((element, i) => {
      formattedRecord[element.name] = record[i]
    })

    return formattedRecord
  })

  return records.length > 0 ? records[0] : null
}


/**
 * Create a new record in the DB
 * 
 * @param table The table to insert the data into
 * @param data The data to populate the new record
 */
const create = async (table: string, data: any) => {

  let sql = `INSERT INTO ${table}`

  const columns = Object.keys(data).join(', ')
  sql = `${sql} (${columns}) VALUES (`

  Object.keys(data).forEach((_, i) => {
    sql = `${sql} $${i+1}, `
  })
  sql = sql.slice(0, -2)

  sql = `${sql});`

  const args = Object.values(data)

  await query(sql, args)
}


/**
 * Update a/some record(s) in the DB
 * 
 * @param table The table to update the data in
 * @param conditions The conditions the record(s) being updated need to meet
 * @param data The data being updated in the record
 */
const update = async (table: string, conditions: any, data: any) => {

  let sql = `UPDATE ${table} SET`

  let i = 1
  const args: any[] = []

  Object.keys(data).forEach(key => {
    sql = `${sql} ${key}=$${i++},`
    args.push(data[key])
  })

  sql = sql.slice(0, -1)

  Object.keys(conditions).forEach((key, j) => {
    sql = `${sql} ${j ? 'AND' : 'WHERE'} "${key}"=$${i++}`
    args.push(conditions[key])
  })

  sql = `${sql};`

  await query(sql, args)
}


/**
 * Delete a/some record(s) from the DB
 * 
 * @param table The table from which to delete the row(s)
 * @param conditions The conditions to determine which row(s) to delete
 */
const destroy = async (table: string, conditions: any) => {

  let sql = `DELETE FROM ${table}`

  Object.keys(conditions).forEach((key, i) => {
    sql = `${sql} ${i ? 'AND' : 'WHERE'} "${key}" = $${i+1}`
  })

  sql = `${sql};`

  const args = Object.values(conditions)

  await query(sql, args)
}


export { init, query, findAll, findOne, create, update, destroy }
