const dotenv = require("dotenv");
require("colors");

require("./db");

dotenv.config();

const countriesList = require("./Data/countries");
const Countries = require("./models/erpModels/countriesModel");

// // States Data
const statesList = require("./Data/states");
const States = require("./models/erpModels/StatesModel");
// All Cities
const citiesList = require("./Data/countries copy")
const Cities = require("./models/erpModels/CitiesModel");
// const getWithPromiseAll = async () => {
//   const getCountryId = async (items) => {
//     const country = await Countries.findOne({ id: items })
//     return country._id
//   }
//   let data = await Promise.all(statesList.map(async (state) => {
//     const item = { ...state }
//     item.country = await getCountryId(state.country_id)
//     return item;
//   }))
//   await States.insertMany(data)
//   console.log("Data Imported!!".green.inverse);
//   process.exit(1);
// }
// getWithPromiseAll();
const getWithPromiseAll = async () => {
  let count = 0
  const getCountryId = async (items) => {
    const country = await Countries.findOne({ id: items })
    return country._id
  }
  const stateId = async (items) => {
    const state = await States.findOne({ id: items })
    return state._id
  }
  const cities = citiesList.filter(item => item.country_id === 110) //110 krna h

  setTimeout(async () => {
    let data = await Promise.all(cities.map(async (city) => {
      const item = { ...city }
      count = count + 1
      console.log(count)
      item.country = await getCountryId(city.country_id)
      item.state = await stateId(city.state_id)
      return item;
    }))
    await Cities.insertMany(data);
    console.log("Data Imported!!".green.inverse);

  }, 4000)


}
getWithPromiseAll();
// const getWithForOf = async () => {
//   const data = []
//   const getCountryId = async (items) => {
//     const country = await Countries.findOne({ id: items })
//     return country._id
//   }
//   const stateId = async (items) => {
//     const state = await States.findOne({ id: items })
//     return state._id
//   }
//   for (const city of citiesList) {
//     const item = { ...city }
//     item.country = await getCountryId(city.country_id)
//     item.state = await stateId(city.state_id)
//     data.push(item);
//     console.log(data.length);
//   }
//   await Cities.insertMany(data)

// }
// getWithForOf();
// const apikey = require("./Models/apiKeysModel")



// const importData = async () => {
//   try {
//     // await Countries.deleteMany();
//     // await Countries.insertMany(countriesList);
//     // await States.insertMany(statesList);
//     // await Cities.insertMany(citiesList);
//     console.log("Data Imported!!".green.inverse);
//     process.exit();
//   } catch (error) {
//     console.log(`${error}`.red.inverse);
//     process.exit(1);
//   }
// };

// const dataDestory = async () => {
//   try {
//     await Countries.deleteMany();
//     console.log("Data Destory".green.inverse);
//     process.exit();
//   } catch (error) {
//     console.log(`${error}`.red.inverse);
//     process.exit(1);
//   }
// };

// if (process.argv[2] === "-d") {
//   dataDestory();
// } else {
//   importData();
// }
