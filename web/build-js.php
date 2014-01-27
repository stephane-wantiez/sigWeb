<?php

define('NL',"\n");

//header('Content-Type: text/plain');

function browseDir($path,&$filesContent)
{
    $dir = opendir($path);
    
    while ($file = readdir($dir))
    {
        $fullPath = $path . '/' . $file ;
    
        if (($file != '.') && ($file != '..'))
        {
            if (is_dir($fullPath))
            {
                browseDir($fullPath,$filesContent);
            }
            else if (is_file($fullPath) && (substr($fullPath,-3) == ".js"))
            {
                treatFile($fullPath,$filesContent);
            }
        }
    }
    
    closedir($dir);
}

function treatFile($path,&$filesContent)
{
    $content = file_get_contents($path) . NL . NL ;
    $content = str_replace('<?php','',$content);
    $filesContent[$path] = $content;
}

function generateConfigFile(&$filesContent)
{
    $outputFileName = 'scripts.js';
    $outputFile = fopen($outputFileName,'w');

    foreach ( $filesContent as $file => $content )
    {
        fwrite($outputFile,NL . '/** From file ' . $file . ' **/' . NL . NL);
        fwrite($outputFile,$content);
        echo 'File ' . $file . ' written' . NL;
    }

    fclose($outputFile);
}

$basePath = '../web-static/js';
$filesContent = [];

browseDir($basePath,$filesContent);
ksort($filesContent);
generateConfigFile($filesContent);

