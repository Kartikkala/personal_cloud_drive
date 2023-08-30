import { expect } from "chai"
import chai from "chai"
import chaiHttp from "chai-http"
import {stopServer} from './teardown.js'
import {app, server} from '../app.js'

after(async ()=>{
    await stopServer(server)
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
})


