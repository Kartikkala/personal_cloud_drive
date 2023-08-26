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
                // sh "npm test"
                script{
                    println "Testing..."
                }
                }
        }
        stage('Build docker image')
        {
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
    }
    post {
        always {
            cleanWs() // Clean up workspace
        }
    }
}