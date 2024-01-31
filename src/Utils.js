const matchedKey = function(source, key) {
  source = source + "";
  if(!source) return false;

  key = key + "";
  if(key === "") return true;
  if(!key) return false;

  key = key.trim().toLowerCase();
  source = source.trim().toLowerCase();

  let matched = source.includes(key);
  return matched;
}

const validateUserSortParam = function(sort){  
  let logError = (reason = "") => {
    console.error("IllegalArgumentException, " + reason + ", got sort = " + sort);
  };
  let defaultReturn = {    
    sortOrder: "asc",
    sortBy: "username"
  };  
  if(!sort) {
    logError(sort);
    return defaultReturn;
  }

  sort += "";
  sort = sort.replace(" ", "");
  sort = sort.toLowerCase();
  let sortSplitted = sort.split(",");
  let sortOrder = sortSplitted[0];
  let sortBy = sortSplitted[1];

  if(!sortOrder || !sortBy){
    logError("must contains both sort order and user column name, found none")
    return defaultReturn;
  } 

  if(!sortOrder.startsWith("asc") && !sortOrder.startsWith("des")){
      logError("no such order, expect 'asc' or 'des'")
      return defaultReturn;
  }

  if(sortOrder.startsWith("asc")){
    sortOrder = 'asc';
  }
  if(sortOrder.startsWith("des")){
    sortOrder = 'des';
  }

  const availableUsernameKey = ["username", "email", "role", "firstname", "lastname"];
  if(!availableUsernameKey.includes(sortBy)){
    logError("no such user column name");
    return {
      sortOrder: sortOrder,
      sortBy: defaultReturn.sortBy
    };
  }

  return {    
    sortOrder: sortOrder,
    sortBy: sortBy
  };  
}


const validateProductSortParam = function(sort){  
  let logError = (reason = "") => {
    console.error("IllegalArgumentException, " + reason + ", got sort = " + sort);
  };
  let defaultReturn = {    
    sortOrder: "asc",
    sortBy: "title_text"
  };  
  if(!sort) {
    logError(sort);
    return defaultReturn;
  }

  sort += "";
  sort = sort.replace(" ", "");
  sort = sort.toLowerCase();
  let sortSplitted = sort.split(",");
  let sortOrder = sortSplitted[0];
  let sortBy = sortSplitted[1];

  if(!sortOrder || !sortBy){
    logError("must contains both sort order and product column name, found none")
    return defaultReturn;
  } 

  if(!sortOrder.startsWith("asc") && !sortOrder.startsWith("des")){
      logError("no such order, expect 'asc' or 'des'")
      return defaultReturn;
  }

  if(sortOrder.startsWith("asc")){
    sortOrder = 'asc';
  }
  if(sortOrder.startsWith("des")){
    sortOrder = 'des';
  }
  const availableSortBys =   ["title_text", "desc_text", "category_name", "likes_count", "visit_count", "download_count", "price", "geometry"];
  if(!availableSortBys.includes(sortBy)){
    logError("no such product column name");
    return {
      sortOrder: sortOrder,
      sortBy: defaultReturn.sortBy
    };
  }

  return {    
    sortOrder: sortOrder,
    sortBy: sortBy
  };  
}


const validateCartSortParam = function(sort){  
  let logError = (reason = "") => {
    console.error("IllegalArgumentException, " + reason + ", got sort = " + sort);
  };
  let defaultReturn = {    
    sortOrder: "asc",
    sortBy: "username"
  };  
  if(!sort) {
    logError(sort);
    return defaultReturn;
  }

  sort += "";
  sort = sort.replace(" ", "");
  sort = sort.toLowerCase();
  let sortSplitted = sort.split(",");
  let sortOrder = sortSplitted[0];
  let sortBy = sortSplitted[1];

  if(!sortOrder || !sortBy){
    logError("must contains both sort order and cart column name, found none")
    return defaultReturn;
  } 

  if(!sortOrder.startsWith("asc") && !sortOrder.startsWith("des")){
      logError("no such order, expect 'asc' or 'des'")
      return defaultReturn;
  }

  const availableSortBys =   ["username", "totalprice", "id", "date_added", "date_updated"];
  if(!availableSortBys.includes(sortBy)){
    logError("no such product column name");
    return {
      sortOrder: sortOrder,
      sortBy: defaultReturn.sortBy
    };
  }

  if(sortOrder.startsWith("asc")){
    sortOrder = 'asc';
  }
  if(sortOrder.startsWith("des")){
    sortOrder = 'des';
  }
  
  //...

  return {    
    sortOrder: sortOrder,
    sortBy: sortBy
  };  
}

module.exports = {matchedKey, validateUserSortParam, validateProductSortParam, validateCartSortParam}
