pipeline {
    agent any
    environment {
        DOCKERHUB_USER = 'danyal722'
    }
    stages {
        stage('Build Frontend') {
            steps {
                sh 'docker build -t $DOCKERHUB_USER/excitecup-frontend:latest -t $DOCKERHUB_USER/excitecup-frontend:${BUILD_NUMBER} ./frontend'
            }
        }
        stage('Build Backend') {
            steps {
                sh 'docker build -t $DOCKERHUB_USER/excitecup-backend:latest -t $DOCKERHUB_USER/excitecup-backend:${BUILD_NUMBER} ./backend'
            }
        }
        stage('Push to Docker Hub') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'U', passwordVariable: 'P')]) {
                    sh '''
                    echo "$P" | docker login -u "$U" --password-stdin
                    docker push $DOCKERHUB_USER/excitecup-frontend:latest
                    docker push $DOCKERHUB_USER/excitecup-frontend:${BUILD_NUMBER}
                    docker push $DOCKERHUB_USER/excitecup-backend:latest
                    docker push $DOCKERHUB_USER/excitecup-backend:${BUILD_NUMBER}
                    '''
                }
            }
        }
        stage('Deploy') {
            steps {
                sh '''
                docker compose down || true
                docker compose up -d
                docker ps
                '''
            }
        }
    }
}
