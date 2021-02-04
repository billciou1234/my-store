'use strict';
const faker = require('faker')
module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    await queryInterface.bulkInsert('Products',
      Array.from({ length: 10 }).map((item, index) =>
        ({
          id: index + 1,
          name: faker.commerce.productName(),
          description: faker.commerce.product() + '/' + faker.commerce.productName(),
          price: faker.commerce.price(),
          image: `https://loremflickr.com/320/240/jewelry/?random=${Math.random() * 100}`,
          createdAt: new Date(),
          updatedAt: new Date(),
          CategoryId: Math.floor(Math.random() * 5) + 1
        })
      ), {})
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('Products', null, {})
  }
};
