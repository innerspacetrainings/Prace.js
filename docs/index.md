---
layout: form
title: PRACE - Pull Request Automated Convention Enforcer
---
## Configuration file generator

Use this form to generate your configuration file.

You can use regular expressions for the pull requests title, body and branch name. If you add more than one condition to a section, Prace will check that **at least one condition** is met. 
If you want a title to comply with all your conditions, you'll have to write one regex that encapsulates all of them.

If you don't know regex, there are a lot of [good tutorials](https://regexone.com/) out there.

You can set how many assignees a review requires, and even specify which users or teams have to be assigned. If at least one of those users or teams is assigned, that check will pass.

For labels you can write any amount you want. If there field is not empty, it will require at least one of the given labels to be in the Pull Request.

The reviewers and the labels are **not** case sensitive.

You can limit how many additions a Pull Request can have.

All of the configuration fields are optional. Only when the field is given it will be checked. 
(An empty file will make all checks pass).