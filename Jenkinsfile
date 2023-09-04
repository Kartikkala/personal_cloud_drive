pipeline{
    agent{
        node{
            label 'agent1'
        }
    }
    options{
        timeout(time: 15, unit: 'MINUTES')
    }
    stages{
        stage('Install Dependencies')
        {
            steps{
                sh "npm ci"
            }
        }
        stage('Setup Aria2c')
        {
            steps{
                sh "aria2c --enable-rpc --rpc-listen-all=true --rpc-allow-origin-all --disable-ipv6 &"
            }
        }
        stage('Run Unit Tests')
        {
            when{
                branch "test"
            }
            steps{
                script{
                    sh "npm test"
                }
                }
        }
        stage('Build test image and push to registry')
        {
            when{
                branch "test"
            }
            steps{
                script{
                    def packageJson = readJSON(file: 'package.json')
                    def version = packageJson.version
                    env.VERSION = version
                    println(version)
                    withDockerRegistry([credentialsId: 'dockerhub-creds', url: ""]){
                        def dockerImage = docker.build("kartikkala/mirror_website")
                        dockerImage.push("$version-test")
                    }
                }
            }
        }
        stage('Deploy test image on test server'){
            when{
                branch "test"
            }
            environment{
                SSH_SERVER_ADDRESS = credentials('deployment-server-address')
                BUILD = "test"
                PORT = 8000
            }
            steps{
                script{
                    withCredentials([sshUserPrivateKey(credentialsId: 'deployment-server-creds', keyFileVariable: 'SSH_PRIVKEY', passphraseVariable: 'SSH_PASS', usernameVariable: 'SSH_USR')]) 
                    {
                        sh "chmod +x docker_pull.sh"
                        sh './docker_pull.sh $SSH_PRIVKEY $SSH_PASS $SSH_USR $SSH_SERVER_ADDRESS $HOME $BUILD $VERSION $PORT'
                    }
                }
            }
        }
        stage('Build and push stable docker image')
        {
            when{
                branch "master"
            }
            steps{
                script
                {
                    def packageJson = readJSON(file: 'package.json')
                    def version = packageJson.version
                    env.VERSION = version
                    println(version)
                    withDockerRegistry([credentialsId: 'dockerhub-creds', url: ""]){
                        def dockerImage = docker.build("kartikkala/mirror_website")
                        dockerImage.push("$version-stable")
                    }
                }
            }
        }
        stage('Deploy stable docker image')
        {
            when{
                branch "master"
            }
            environment{
                SSH_SERVER_ADDRESS = credentials('deployment-server-address')
                BUILD = "stable"
                PORT = 80
            }
            steps{
                script{
                    withCredentials([sshUserPrivateKey(credentialsId: 'deployment-server-creds', keyFileVariable: 'SSH_PRIVKEY', passphraseVariable: 'SSH_PASS', usernameVariable: 'SSH_USR')]) 
                    {
                        sh "chmod +x docker_pull.sh"
                        sh './docker_pull.sh $SSH_PRIVKEY $SSH_PASS $SSH_USR $SSH_SERVER_ADDRESS $HOME $BUILD $VERSION $PORT'
                    }
                }
            }
        }
    }
    post {
        always {
            cleanWs() // Clean up workspace
        }
    }
}