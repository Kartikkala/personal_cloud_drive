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
        stage('Checkout Stage')
        {
            steps{
                checkout scm
            }
        }
        stage('Install Dependencies')
        {
            steps{
                sh "npm ci"
            }
        }
        stage('Build and Test')
        {
            steps{
                sh "npm test"
                }
        }
    }
    post {
        always {
            cleanWs() // Clean up workspace
        }
    }
}