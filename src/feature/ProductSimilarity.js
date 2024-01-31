const { ProductRepo } = require("../repository/product.repo");

class ProductSimilarity {
  static #categories = [];

  static {
    ProductRepo.getAllCategories()
      .then(
        allCategories => {
          this.#categories = allCategories;
          console.log("DONE GET allCategories ", this.#categories);
          console.log("========================================================");
          console.log("========================================================");
          console.log("========================================================");
        }
      )
  }

  static doesProductBelongToCategoryHierachy(topCategory, product, maxDepth = 4) {
    if(!topCategory) 
      topCategory = this.#categories.find(category => {
        return category.id === 0;
      });
      
    console.log("topCategory ", topCategory);
    let nextCateg = this.#categories.find(category => {
      return category.id === Number(product.categoryId);
    });

    console.log("nextCateg ", nextCateg);
    let currentDepthCount = 1;
    while (nextCateg != null) {
      if (nextCateg.id === topCategory.id) {
        return true;
      }
      nextCateg = this.#categories.find(category => {
        return category.id === nextCateg.parentId;
      });
      
      console.log("nextCateg ", nextCateg);
      currentDepthCount++;
      if (currentDepthCount > maxDepth) {
        break;
      }
    }
    return false;
  }

  static isSimilar(originalProduct, otherProduct) {
    if (!originalProduct || !otherProduct) {
      console.error("NULL PARAMS originalProduct ", originalProduct, " otherProduct = ", otherProduct);
      return;
    }
    let title_text = originalProduct.title_text;
    let title_texts = title_text.split(" ");
    console.log("title_texts ", title_texts);
    if (otherProduct.title_text.includes(title_texts[0])) {
      console.log("matched by title_text: ", title_texts[0]);
      return true;
    }
    if (title_texts[1] && otherProduct.title_text.includes(title_texts[1])) {
      console.log("matched by title_text: ", title_texts[1]);
      return true;
    }
    if (title_texts[2] && otherProduct.title_text.includes(title_texts[2])) {
      console.log("matched by title_text: ", title_texts[2]);
      return true;
    }

    let originalProductCateg = this.#categories.find(anyCateg => anyCateg.id === Number(originalProduct.categoryId));
    let originalProductCategs = [originalProductCateg];
    let cursor = originalProductCateg
    while(cursor && cursor.id > 0){
      cursor = this.#categories.find(anyCateg => anyCateg.id === Number(cursor.parentId));
      if(cursor.id > 0){
        originalProductCategs.push(cursor);
      }
    }
    console.log("originalProductCategs ", originalProductCategs);

    if (otherProduct.categoryId == originalProduct.categoryId) {
      console.log("matched by category");
      return true;
    }

    let otherProductCateg = this.#categories.find(anyCateg => anyCateg.id === Number(otherProduct.categoryId));
    cursor = otherProductCateg;
    while(cursor && cursor.id > 0){
      cursor = this.#categories.find(anyCateg => anyCateg.id === Number(cursor.parentId));
      if(cursor.id > 0){
        if(originalProductCategs.includes(cursor)){
          console.log("matched by category");
          return true;
        }
      }
    }
    
    // let originalCategId = originalProduct.categoryId;
    // let otherCategId = otherProduct.categoryId;

    // let switchToOtherCateg = true;
    // while(originalCategId > 0 && otherCategId > 0){
    //   console.log("originalCategId ", originalCategId);
    //   console.log("otherCategId ", otherCategId);
    //   console.log("-------------------------- ");

    //   if (otherCategId == originalCategId) {
    //     console.log("matched by category");
    //     return true;
    //   }

    //   if(switchToOtherCateg){
    //     let nextCateg = this.#categories.find(category => {
    //       return category.id === Number(otherCategId);
    //     });
    //     console.log("switchToOtherCateg ? ", switchToOtherCateg, " nextCateg = ", nextCateg);
    //     if(!nextCateg) break;
    //     otherCategId = nextCateg.parentId;
    //   }
    //   else{
    //     let nextCateg = this.#categories.find(category => {
    //       return category.id === Number(originalCategId);
    //     });
    //     console.log("switchToOtherCateg ? ", switchToOtherCateg, " nextCateg = ", nextCateg);
    //     if(!nextCateg) break;
    //     originalCategId = nextCateg.parentId;
    //   }
    //   switchToOtherCateg = !switchToOtherCateg;
    // }  

    // if (otherCategId == originalCategId) {
    //   console.log("matched by category");
    //   return true;
    // }

    return false;
  }

  static filterSimilars(allProducts,
    originalProduct,
    foundCountMax = 3) {

    let similars = []
    let foundCount = 0;

    console.log("filterSimilar, originalProduct.title_text = ", originalProduct.title_text);
    allProducts.every(
      (eachProduct, idx) => {
        if (Number(eachProduct.id) === Number(originalProduct.id)) {
          return true;
        }
        console.log("browsing ", eachProduct.title_text);
        if (ProductSimilarity.isSimilar(originalProduct, eachProduct)) {
          foundCount++;
          similars.push(eachProduct);

          console.log("matched ", eachProduct.title_text);
          console.log("-----------------------------");
        }

        if (foundCount >= foundCountMax) return false;
        return true;
      }
    );
    console.log("similars ", similars.map(each => each.title_text));
    return similars;
  }
}

module.exports = { ProductSimilarity };