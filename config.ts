const dbCreds = {
  user: Deno.env.get('DB_USER'),
  database: Deno.env.get('DATABASE'),
  password: Deno.env.get('DB_PASSWORD'),
  hostname: Deno.env.get('DB_HOST'),
  // @ts-ignore 
  port: +Deno.env.get('DB_PORT')
}

const jwtKey = Deno.env.get('JWT_KEY')

export { dbCreds, jwtKey }
