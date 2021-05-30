const app   = require('../app1.js');
const offices = 6; //posibles files would be: 0,1,4,6,12

//
test(`total of ${offices} offices`,()=>{
    expect(app(`samples/file${offices}.txt`,false)).toBe(offices);
})
