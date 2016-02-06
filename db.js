var knex = require('knex')({
  client: 'mysql',
  connection: {
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : 'test2'
  }
});

// knex.raw('select * from Users').then(function (data) {
//   console.log('it worked?',data);
// });

// console.log(knex.connection());
var bookShelf = require('bookshelf')(knex);

//drop em
knex.schema.dropTableIfExists('authors_books')
.then(function(res){
  console.log('result from dropping authors_books', res);
  return knex.schema.dropTableIfExists('authors');
})
.then(function(res){
  console.log('result from dropping authors', res);
  return knex.schema.dropTableIfExists('books');
})
.then(function(res){
  console.log('result from building books', res);
  return knex.schema.createTableIfNotExists('authors', function (author) {
    author.increments('id').primary();
    author.string('name');
  });
})
.then(function(res){
  console.log('result from building authors', res);
  return knex.schema.createTableIfNotExists('books', function (book) {
    book.increments('id').primary();
    book.string('name');
  });
})
.then(function(res){
  console.log('result from building books', res);
  return  knex.schema.createTableIfNotExists('authors_books', function (table) {
    table.integer('author_id').unsigned().references('authors.id');
    table.integer('book_id').unsigned().references('books.id');
  });
})
.then(function(res){
  console.log('result from building authors_books', res);

  var Author = bookShelf.Model.extend({
    tableName: 'authors',
    books: function() {
      return this.belongsToMany(Book);
    }
  });

  var Book = bookShelf.Model.extend({
    tableName: 'books',
    authors: function() {
      return this.belongsToMany(Author);
    }
  });

  var author1 = 'Ted';
  var author2 = 'Bob';
  var bookTitle  = 'Three Bears';

  // var a1 = new Author({name: author1});
  // var a2 = new Author({name: author2});
  // var b1 = new Book({name: bookTitle});


//   a1.save()
//   .then(function() {
//     console.log('added ' + author1);
//     return new Book({name: 'Jack Jill'}).save();
//   })
//   .then(function(book) {
//     console.log('added ' + bookTitle);
//     return a1.books().attach(book);
//   })
//   .then(function(){
//     console.log('adding ' + author2);
//     return a2.save()
//   })
//   .then(function(author) {
//     console.log('saved ' + author2);
//     return Book.where('name', bookTitle).fetch();

//   }).then(function(book){
//     console.log(book);

//     if(book){
//       console.log('found book');
//       return a2.books().attach(book);    
//     }

//     return b1.save().then(function(book) {
//       console.log('new book saved' + bookTitle);
//       return a2.books().attach(book);    
//     });  
//   })


  var createIfNotExists = function(table,attrs){
    console.log('checking if exists: ', attrs);

    return table.where(attrs).fetch()
    .then(function(model){
      if(model){
        console.log('already have', JSON.stringify(attrs), 'in', table);
        return model;
      }
      console.log('creating new ', JSON.stringify(attrs), 'in', table);
      return new table(attrs).save();
    });
  }

  var addAuthorAndBook = function(authorName,bookTitle){

    var a;
    console.log('adding', authorName, bookTitle);

    return createIfNotExists(Author,{name:authorName})
    .then(function(author){
      console.log('here is the author', author);
      a = author;
      return createIfNotExists(Book,{name:bookTitle})
    })
    .then(function(book){
      console.log('here is the book', book);
      book.authors().attach(a);
    })

  };


  var addArrayOfAuthorBookObjects = function(arrayOfStuff){ //[{author:string, book:string}, {author:string, book:string}]
    //input checking

    var recursiveFn =  function(i, promise){
      
      promise = promise || null;

      if(i < 0){
        return promise;
      }

      console.log('adding',i, JSON.stringify(arrayOfStuff[i]));
      return addAuthorAndBook(arrayOfStuff[i].author, arrayOfStuff[i].book)
      .then(function(promise){
        recursiveFn(i-1, promise); 
      });

    }

    recursiveFn(arrayOfStuff.length-1);
  }

  var grabAuthorsFromBookName = function(bookName){
    Book.where({name:bookName}).fetch({withRelated: ['authors.books']})
    .then(function(authorCollection){
      console.log('here are all the authors that wrote', bookName);
      console.log(authorCollection.related('authors').toJSON());

    })
  };


  // addAuthorAndBook('Nick','How to be a nn')
  // .then(function(){
  //   return addAuthorAndBook('Sola','How to be a gangster');
  // })
  // .then(function(){
  //   return addAuthorAndBook('Raph','How to be a nn');
  // })
  // .then(function(){
  //   return addAuthorAndBook('Daniel','How to be a nn');
  // })
  // .then(function(){
  //   grabAuthorsFromBookName('How to be a nn');
  // })

  addArrayOfAuthorBookObjects([
    {author: 'Nick', book:'how to be a nn'},
    {author: 'Sola', book:'how to be a gangasta'},
    {author: 'Raph', book:'how to be a nn'},
    {author: 'Daniel', book:'how to be a nn'}
  ]);

  // addAuthorAndBook('Sola','How to be a gangster');
  // addAuthorAndBook('Raph','How to be a nn');
  // addAuthorAndBook('Daniel','How to be a nn');

});


// knex.destroy(function(){
//   console.log('destroyed');
// });
