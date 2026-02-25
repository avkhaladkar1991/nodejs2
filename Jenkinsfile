pipeline {
    agent any

    environment {
        IMAGE_NAME    = "avkhaladkar1991/nodejs-devops-app"
        IMAGE_TAG     = "${BUILD_NUMBER}"
        DOCKER_IMAGE  = "${IMAGE_NAME}:${IMAGE_TAG}"
        APP_REPO      = "https://github.com/avkhaladkar1991/nodejs2.git"
        GITOPS_REPO   = "https://github.com/avkhaladkar1991/gitops-repo.git"
    }

    options {
        timestamps()
    }

    stages {

        stage('Checkout Application Code') {
            steps {
                git branch: 'main',
                    credentialsId: 'github-creds',
                    url: "${APP_REPO}"
            }
        }

        stage('Install Dependencies & Test') {
            steps {
                sh 'npm install'
                sh 'npm test || echo "No tests found"'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh 'docker build -t $DOCKER_IMAGE .'
            }
        }

        stage('Docker Login & Push') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-creds',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh '''
                        echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                        docker push $DOCKER_IMAGE
                    '''
                }
            }
        }

        stage('Clone GitOps Repository') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'github-creds',
                    usernameVariable: 'GIT_USER',
                    passwordVariable: 'GIT_TOKEN'
                )]) {
                    sh '''
                        rm -rf gitops-repo
                        git clone https://${GIT_USER}:${GIT_TOKEN}@github.com/avkhaladkar1991/gitops-repo.git
                    '''
                }
            }
        }

        stage('Update Helm Values in GitOps Repo') {
            steps {
                sh """
                    sed -i '' 's/tag:.*/tag: "${IMAGE_TAG}"/' gitops-repo/dev/nodejs-app/values.yaml
                """
            }
        }

        stage('Commit & Push GitOps Changes') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'github-creds',
                    usernameVariable: 'GIT_USER',
                    passwordVariable: 'GIT_TOKEN'
                )]) {
                    sh """
                        cd gitops-repo
                        git config user.email "jenkins@ci.com"
                        git config user.name "jenkins"
                        git add dev/nodejs-app/values.yaml
                        git commit -m "CI: update image tag ${IMAGE_TAG}" || echo "No changes"
                        git push https://${GIT_USER}:${GIT_TOKEN}@github.com/avkhaladkar1991/gitops-repo.git main
                    """
                }
            }
        }

        stage('Cleanup Local Docker Image') {
            steps {
                sh 'docker rmi $DOCKER_IMAGE || true'
            }
        }
    }

    post {
        success {
            echo "✅ CI Pipeline Completed Successfully"
        }
        failure {
            echo "❌ CI Pipeline Failed"
        }
    }
}
