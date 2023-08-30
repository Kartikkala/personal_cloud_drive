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
        stage('Build and push docker image on master branch')
        {
            when{
                branch "master"
            }
            steps{
                script
                {
                    def packageJson = readJSON(file: 'package.json')
                    def version = packageJson.version
                    println(version)
                    withDockerRegistry([credentialsId: 'dockerhub-creds', url: ""]){
                        def dockerImage = docker.build("kartikkala/mirror_website")
                        dockerImage.push("$version")
                    }
                }
            }
        }
        stage('Deploy server on master branch')
        {
            when{
                branch "master"
            }
            steps{
                script{
                    withCredentials([sshUserPrivateKey(credentialsId: 'deployment-server-creds', keyFileVariable: 'SSH_PRIVKEY', passphraseVariable: 'SSH_PASS', usernameVariable: 'SSH_USR')]) 
                    {
                        sh "chmod +x docker_pull.sh"
                        sh './docker_pull.sh $SSH_PRIVKEY $SSH_PASS $SSH_USR $SSH_SERVER_ADDRESS'
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