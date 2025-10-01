const bcrypt = require('bcrypt')

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex('users').del()

  // Hash passwords
  const saltRounds = 10
  const hashedPasswords = await Promise.all([
    bcrypt.hash('password123', saltRounds),
    bcrypt.hash('jane2023', saltRounds),
    bcrypt.hash('mike456', saltRounds),
    bcrypt.hash('sarah789', saltRounds),
    bcrypt.hash('david2024', saltRounds),
    bcrypt.hash('lisa321', saltRounds),
    bcrypt.hash('chris654', saltRounds),
    bcrypt.hash('emily987', saltRounds),
    bcrypt.hash('robert147', saltRounds),
    bcrypt.hash('amanda258', saltRounds)
  ])

  // Inserts seed entries
  await knex('users').insert([
    {
      email: 'john.doe@example.com',
      fullName: 'John Doe',
      birthday: '1990-05-15',
      password: hashedPasswords[0],
      phone: '+1234567890',
      address: '123 Main St, New York, NY 10001'
    },
    {
      email: 'jane.smith@example.com',
      fullName: 'Jane Smith',
      birthday: '1985-08-22',
      password: hashedPasswords[1],
      phone: '+1234567891',
      address: '456 Oak Ave, Los Angeles, CA 90210'
    },
    {
      email: 'mike.johnson@example.com',
      fullName: 'Mike Johnson',
      birthday: '1992-12-03',
      password: hashedPasswords[2],
      phone: '+1234567892',
      address: '789 Pine Rd, Chicago, IL 60601'
    },
    {
      email: 'sarah.williams@example.com',
      fullName: 'Sarah Williams',
      birthday: '1988-03-17',
      password: hashedPasswords[3],
      phone: '+1234567893',
      address: '321 Elm St, Houston, TX 77001'
    },
    {
      email: 'david.brown@example.com',
      fullName: 'David Brown',
      birthday: '1995-09-28',
      password: hashedPasswords[4],
      phone: '+1234567894',
      address: '654 Maple Dr, Phoenix, AZ 85001'
    },
    {
      email: 'lisa.davis@example.com',
      fullName: 'Lisa Davis',
      birthday: '1987-06-11',
      password: hashedPasswords[5],
      phone: '+1234567895',
      address: '987 Cedar Ln, Philadelphia, PA 19101'
    },
    {
      email: 'chris.wilson@example.com',
      fullName: 'Chris Wilson',
      birthday: '1993-01-25',
      password: hashedPasswords[6],
      phone: '+1234567896',
      address: '147 Birch St, San Antonio, TX 78201'
    },
    {
      email: 'emily.garcia@example.com',
      fullName: 'Emily Garcia',
      birthday: '1991-07-08',
      password: hashedPasswords[7],
      phone: '+1234567897',
      address: '258 Spruce Ave, San Diego, CA 92101'
    },
    {
      email: 'robert.martinez@example.com',
      fullName: 'Robert Martinez',
      birthday: '1989-11-14',
      password: hashedPasswords[8],
      phone: '+1234567898',
      address: '369 Willow Ct, Dallas, TX 75201'
    },
    {
      email: 'amanda.taylor@example.com',
      fullName: 'Amanda Taylor',
      birthday: '1994-04-02',
      password: hashedPasswords[9],
      phone: '+1234567899',
      address: '741 Aspen Way, San Jose, CA 95101'
    }
  ])
}