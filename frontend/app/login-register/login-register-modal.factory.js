'use strict'
/**
Module containing the modal responsible for controlling log in and register.
**/
angular.module('moviez.login-register-modal', [])

.factory('loginRegisterModal', loginRegisterModal)

loginRegisterModal.$inject = ['$uibModal'];

function loginRegisterModal($uibModal) {
  var service = {
    showModal: showModal
  };

  return service;

  function showModal() {
    var uibModalInstance = $uibModal.open({
      animation: true,
      size: 'md',
      templateUrl: 'login-register/login-register-modal.view.html',
      controller: LoginRegisterModalCtrl,
      controllerAs: 'vm'
    });

    LoginRegisterModalCtrl.$inject=['$uibModalInstance', 'RegisterFactory', 'LoginFactory', 'UserFactory'];
    function LoginRegisterModalCtrl($uibModalInstance, RegisterFactory, LoginFactory, UserFactory){
      var vm = this;
      vm.setActive = setActive;
      vm.login = login;
      vm.register = register;
      vm.recoverPassword = recoverPassword;
      vm.validateUsername = validateUsername;
      vm.validateEmail = validateEmail;
      vm.validatePassword = validatePassword;
      vm.error = false;

      vm.activeFunction = {
        login: true,
        register: false,
        forgotPassword: false
      };

      vm.credentials = {
        username: '',
        email: '',
        password: '',
        passwordRepeated: ''
      };

      vm.credentialsValid = {
        username: false,
        email: false,
        password: false,
      };

      function setActive(part) {
        Object.keys(vm.activeFunction).forEach((key) => {
          if(key == part){
            vm.activeFunction[key] = true;
          }else{
            vm.activeFunction[key] = false;
          }
        })
      }

      function login() {
        LoginFactory.loginUser(vm.credentials).then((result) => {
          vm.error = false;
          UserFactory.updateUser(result.data);
          LoginFactory.setCredentials(result.data.token);
          uibModalInstance.close();
        }, () => {
          vm.error = true;
        });
      }

      function register() {
        if(credentialsValid()) {
          RegisterFactory.registerUser(vm.credentials).then((result) => {
            if(result.status === 200 || result.status === 201){
              LoginFactory.setCredentials(result.data.token);
              UserFactory.updateUser(result.data);
              uibModalInstance.close();
              UserFactory.verifyUser();
            }else if(result.status === 409){
              /*TODO Add error handling */
            }else if(result.status === 400){
              /*TODO Add error handling */
            }else{}
          })
        }else{
          /*TODO Implement error handling */
        }
      }

      function recoverPassword() {
        /*TODO Implement password recovery */
      }


      function validateUsername() {
        vm.credentialsValid.username = RegisterFactory.validateUsername(vm.credentials.username);
      }

      function validateEmail() {
        vm.credentialsValid.email = RegisterFactory.validateEmail(vm.credentials.email);
      }

      function validatePassword() {
        vm.credentialsValid.password = RegisterFactory.validatePassword(vm.credentials.password, vm.credentials.passwordRepeated);
      }

      function credentialsValid() {
        Object.keys(vm.credentialsValid).forEach((key) =>{
          if (!vm.credentialsValid[key]){
            return false;
          }
        });
        return true;
      }
    }
  }
}
