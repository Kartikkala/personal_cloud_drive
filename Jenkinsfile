pipeline{
    agent{
        label "agent1"
    }
    options{
        timeout(time: 15, unit: 'MINUTES')
    }
    stages{
        stage('Build Stage')
        {
            steps{
                echo 'Entring First stage'
            }
        }
    }
}