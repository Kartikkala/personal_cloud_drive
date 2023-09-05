import { expect } from "chai"
import chai from "chai"
import chaiHttp from "chai-http"
import {disconnectAria2, stopServer} from './teardown.js'
import {app, server, aria2c} from '../app.js'

after(async ()=>{
    try{
        await stopServer(server)
        console.log("Server stopped!!!")
        await disconnectAria2(aria2c)
    }
    catch(err){
        console.error(err)
    }
})

chai.use(chaiHttp)


describe('Test routes', function (){

    it('Should get 200 response status with / route', function (done){
        chai.request(app)
        .get('/')
        .end(function (err, res){
            if(err){
                done(err)
            }
            else{
                expect(res).to.have.status(200)
                done()
            }
        })
    })

    it('Test route /downloads', function(done){
        chai.request(app)
        .get('/downloads')
        .end(function (err, res){
            if(err)
            {
                done(err)
                throw new Error(err)
            }
            else{
                expect(res).to.have.status(200)
                expect(res).to.be.a('Object', 'Response from /downloads is not an object')
                done()
            }
        })
    })

    it('Test route /downloadFileServer', function(done){
        chai.request(app)
        .post('/downloadFileServer')
        .send({
            "uri":"http://139.59.77.129:9000/downloadFileClient/test.jar"
        }
        )
        .end(function (err, res){
            if(err){
                done(err)
            }
            else{
                expect(res).to.have.status(200)
                expect(res.body).to.be.a("Object", "Response from /downloadFileServer is not an object")
                expect(res.body).to.have.property("active", true, "Response from /downloadFileServer does not have any property 'active'.")
                done()
            }
        })
    }).timeout(8000)

    it('Test route /downloadFileClient', function(done){
        chai.request(app)
        .get('/downloadFileClient/testis.jar')
        .end(function (err, res){
            if(err){
                done(err)
                throw new Error(err)
            }
            else{
                expect(res).to.satisfy((response) => {
                    return response.status === 200 || response.status === 404
                  });
                done()
            }
        })
    }).timeout(10000)
})


