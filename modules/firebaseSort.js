const firebaseSort ={
  byData: function(snapshot,categoryId){
    let sortData =[]
    snapshot.forEach(function(snapshotChild){
      if(snapshotChild.val().status === 'public' && snapshotChild.val().category === categoryId){
        sortData.push(snapshotChild.val())
      }
    })
    sortData.reverse()
    return sortData
  },
  byPath:function(snapshot,categoryPath){
    let id =''
    snapshot.forEach(function(snapshotChild){
      if(snapshotChild.val().path === categoryPath){
        id = snapshotChild.val().id
      }
    })
    return id
  }
}

module.exports = firebaseSort