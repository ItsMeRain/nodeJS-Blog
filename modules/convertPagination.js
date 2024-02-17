
const conertPagination = function(sourceData,currentPage){
  const totalResult = sourceData.length // 總資料數
  const perpage = 3 // 每頁有幾筆資料 3
  const pageTotal = Math.ceil(totalResult / perpage) // 總共幾頁
  if(currentPage > pageTotal){
    currentPage = pageTotal
  }

  const mixItem = (perpage * currentPage)- perpage +1
  const maxItem = (perpage * currentPage)
  const data =[]
  sourceData.forEach(function(item,i){
    let itemNum = i +1
    if( itemNum >= mixItem && itemNum <=maxItem ){
      data.push(item)
    }
  })
  const page = {
    pageTotal,
    currentPage,
    hasNextPage: pageTotal > currentPage,
    hasPreviousPage: currentPage > 1
  }
  // console.log(`總資料比數：${totalResult} 每頁數量：${perpage} 總頁數：${pageTotal} 目前頁數：${currentPage}，小：${mixItem} 大：${maxItem}`);
  return {
    page,
    data
  }
}

module.exports = conertPagination
