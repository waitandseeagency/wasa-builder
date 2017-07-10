#!/usr/bin/env node

'use strict';

// Packages
const chalk = require('chalk');
const clear = require('clear');
const CLI = require('clui');
const Spinner = CLI.Spinner;
const figlet = require('figlet');
const inquirer = require('inquirer');
const _ = require('lodash');
const git = require('simple-git')();
const touch = require('touch');
const fs = require('fs');
const download = require('download-git-repo')

// Files imports
const files = require('./lib/files');
const questions = require('./lib/questions');

// Declaring global variables
let gitDetected;
let projectName;
let projectDirectory;

// Clear terminal
clear();

// Init cli head
console.log(chalk.yellow(figlet.textSync('|| WASA-CLI ||', {horizontalLayout: 'full'})));
console.log(chalk.cyan('Welcome to the Wasa Builder. Let\'s initiliaze together your boilerplate !'));

// Check if there is this already a git repo
const wasaInit = () => {
  if (files.directoryExists('.git')) {
    gitDetected = true;
    askContinue();
  } else {
    askProjectName();
  }
}

// Ask continue (git repository detected)
const askContinue = () => {
  questions.gitContinue(function() {
    if (arguments[0].gitContinue) {
      askProjectName();
    } else {
      console.log(chalk.red.bold('Process aborted,') + ' we advise you to move to a new directory.');
      process.exit();
    }
  })
}

// Ask project name
const askProjectName = () => {
  questions.projectName(function() {
    projectName = arguments[0].projectName.toLowerCase();
    console.log(`Your project will be named ${chalk.blue.bold(projectName)}.`);
    askProjectDirectory();
  });
}

// Ask project location
const askProjectDirectory = () => {
  questions.projectDirectory(projectName, function() {
    console.log(arguments);
    if (arguments[0].projectDirectory.length == 0 && files.directoryExists(projectName)) {
      // if input empty but directory already exists then reboot function
      console.log(`${chalk.red('>>')} There is already a directory named ${projectName}.`);
      askProjectDirectory();
    } else if (arguments[0].projectDirectory.length == 0) {
      projectDirectory = projectName;
      console.log('You project will be installed in the directory ' + chalk.blue.bold('./') + chalk.blue.bold(projectDirectory));
      if (gitDetected) {
        // if git detected skip add repo
        dlBoilerplate(projectName);
      } else {
        askProjectGit();
      }
    } else {
      projectDirectory = arguments[0].projectDirectory;
      console.log('You project will be installed in the directory' + chalk.blue.bold('./') + chalk.blue.bold(projectDirectory));
      if (gitDetected) {
        // if git detected skip add repo
        dlBoilerplate(projectName);
      } else {
        askProjectGit();
      }
    }
  })
}

// Ask project git
const askProjectGit = () => {
  questions.projectGit(function() {
    if (arguments[0].projectGit == 1) {
      askGitRepo();
    } else {
      fs.mkdirSync(projectDirectory);
      dlBoilerplate(projectName);
    }
  })
}

// Ask git repository
const askGitRepo = () => {
  questions.gitRepo(function() {
    const gitRepo = arguments[0].gitRepo;
    // clone desired repository
    const status = new Spinner('Cloning repository, please wait...');
    status.start();
    git.clone(gitRepo, projectDirectory).exec(function() {
      status.stop();
      console.log('Repository successfully cloned.');
      dlBoilerplate(projectName);
    });
  })
}

// W&S Agency Boilerplate Download
const dlBoilerplate = (projectName) => {
  console.log(chalk.blue.bold('We will now download the WASA Boilerplate.'));
  setTimeout(() => {
    const status = new Spinner('Downloading boilerplate, please wait...');
    status.start();
    download('waitandseeagency/wasa-boilerplate', `${projectDirectory}/`, function(err) {
      status.stop();
      console.log(err
        ? 'Error'
        : 'We successfully downloaded the WASA Boilerplate, you\'re all set up :) !');
    });
  }, 2000)
}

// Start wasa-cli
wasaInit();
