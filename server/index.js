const express = require('express');
const app = express();

app.use(express.json());




const {
    client,
    createTables,
    createCustomer,
    createRestaurant,
    fetchRestaurants,
    fetchCustomers,
    createReservation,
    destroyReservation
} = require('./db');

app.get('/api/customer', async(req, res, next)=> {
    try {
      res.send(await fetchCustomers());
    }
    catch(ex){
      next(ex);
    }
  });
  
  app.get('/api/restaurant', async(req, res, next)=> {
    try {
      res.send(await fetchRestaurants());
    }
    catch(ex){
      next(ex);
    }
  });
  
  
  app.delete('/api/customer/:customer_id/reservation/:id',  async(req, res, next)=> {
    try {
        await destroyReservation({customer_id: req.params.customer_id, id: req.params.id});
        res.sendStatus(204);
    }
    catch(ex){
        next(ex);
    }
});



const init = async()=> {
    console.log('connecting to database');
    await client.connect();
    console.log('connected to database');
    await createTables();
    console.log('created tables');
    const [moe, lucy, larry, ethyl, paris, london, nyc] = await Promise.all([
        createCustomer({ name: 'moe'}),
        createCustomer({ name: 'lucy'}),
        createCustomer({ name: 'larry'}),
        createCustomer({ name: 'ethyl'}),
        createRestaurant({ name: 'paris'}),
        createRestaurant({ name: 'london'}),
        createRestaurant({ name: 'nyc'}),
    ]);
    console.log(await fetchCustomers());
    console.log(await fetchRestaurants());

    const [reservation, reservation2] = await Promise.all([
        createReservation({
        customer_id: moe.id,
        restaurant_id: nyc.id,
        date: '02/14/2024',
        party_count: 4
        }),
        createReservation({
            customer_id: moe.id,
            restaurant_id: nyc.id,
            date: '02/28/2024',
            party_count: 3
        }),
    ]);
    //console.log(await fetchVacations());
    await destroyReservation({ id: reservation.id, customer_id: reservation.user_id});
    //console.log(await fetchVacations());

    const port = process.env.PORT || 3000;
    app.listen(port, ()=> {
        console.log(`listening on port ${port}`);
        console.log('some curl commands to test');
        console.log(`curl localhost:${port}/api/customer`);
        console.log(`curl localhost:${port}/api/restaurant`);
       console.log(`curl localhost:${port}/api/reservation`);
       console.log(`curl -X DELETE localhost:${port}/api/customer/${moe.id}/restaurant/${reservation2.id}`);
     });

};

init();

