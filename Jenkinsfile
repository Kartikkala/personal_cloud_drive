pipeline{
    agent{
        node{
            label 'agent1'
            customWorkspace "$HOME"
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
            npm ci
        }
        stage('Build and Test')
        {
            npm test
        }
    }
}