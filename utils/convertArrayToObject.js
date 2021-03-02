module.exports = convertArrayToObject = (array, key) =>
  array.reduce((acc, item) => {
    acc[item[key]] = item;
    return acc;
  }, {});
