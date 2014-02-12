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
    //$content = str_replace('<?php','',$content);
    $filesContent[$path] = $content;
}

function generateConfigFile(&$filesContent,$targetFile)
{
    $outputFile = fopen($targetFile,'w');
    fwrite($outputFile, '/** ' . NL . '* Script file generated on ' . date(DATE_RFC2822) . NL . '**/' . NL . NL);

    foreach ( $filesContent as $file => $content )
    {
    	$filePath = realpath($file);
        fwrite($outputFile,NL . '/** From file ' . $filePath . ' **/' . NL . NL);
        fwrite($outputFile,$content);
        echo 'File ' . $filePath . ' written' . NL;
    }

    fclose($outputFile);
}

$basePath = '../../';
$sourcePath = $basePath . 'web-static-src/';
$targetFile = $basePath . 'web-static/js/script.js';
$filesContent = [];

echo "Building JavaScript script file..." . NL;
echo "Source path: " . realpath($sourcePath) . NL;
echo "Target file: " . $targetFile . NL;

browseDir($sourcePath,$filesContent);
ksort($filesContent);
generateConfigFile($filesContent,$targetFile);

echo "Generation done.";
