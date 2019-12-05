---
layout: form
title: PRACE - Pull Request Automated Convention Enforcer
---
## Configuration file generator

Use this form to generate your configuration file.

For the Pull Request titles, body and branch name, you can use regular expressions. If you add more than one condition to a section, Prace will check that *at least one condition* is met, so, if you want a title to comply with all your conditions, you'll have to write a single  regex that encapsulates all of them.

If you don't know regex, there are a lot of [good tutorials](https://regexone.com/) out there.

You can set how many assignes a review require, and even specify which users or teams need to have it assigned. While at least one of those users is assigned, that check will pass.

For labels you can also write your label name if you require one.

The reviewers and the labels are not case sensitive.

You can limit how many additions a Pull Request can have.

All of the configuration fields are optional, they can be removed and that particular check won't be done. 
(An empty file will make all checks to be approved).