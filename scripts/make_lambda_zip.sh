#!/bin/sh
source ~/.bash_profile
VENV_DIR=`virtualenvwrapper_get_site_packages_dir`

echo $VENV_DIR

PTW_DIR=`pwd`
ZIP_FILE_NAME=${PTW_DIR}/all_lambda.zip

echo $ZIP_FILE_NAME

cd $VENV_DIR
zip -9 -ru $ZIP_FILE_NAME jwt certifi chardet fanout.py idna pubcontrol requests urllib3

cd $PTW_DIR/lambda
zip -9 -u $ZIP_FILE_NAME lambda.py

cd $PTW_DIR
