<?php
/*
# filetree parses directories server-side for FileTree.js 
# Adapted from jqueryFileTree.php by Cory S.N. LaViska
# (original copyright notice reproduced below).
#
#	This file part of:	VisiOmatic
#	Copyright:		(C) 2014 Emmanuel Bertin - IAP/CNRS/UPMC,
#                        Chiara Marmo - IDES/Paris-Sud,
#
#	Last modified: 11/02/2014

//
// jQuery File Tree PHP Connector
//
// Version 1.01
//
// Cory S.N. LaViska
// A Beautiful Site (http://abeautifulsite.net/)
// 24 March 2008
//
// History:
//
// 1.01 - updated to work with foreign characters in directory/file names (12 April 2008)
// 1.00 - released (24 March 2008)
//
// Output a list of files for jQuery File Tree
//
*/
$dir = urldecode($_POST['dir']);
$fitsregexp = '/.*\.fits?$/';
$ptifdir = '/raid/iip/';
if( file_exists($dir) ) {
	$files = scandir($dir);
	natcasesort($files);
	if( count($files) > 2 ) { // The 2 accounts for . and .. 
		echo "<ul class=\"filetree\" style=\"display: none;\">";
		// All dirs
		foreach( $files as $file ) {
			if( file_exists($dir . $file) && $file != '.' && $file != '..' && is_dir($dir . $file) ) {
				echo "<li class=\"directory collapsed\"><a href=\"#\" rel=\"" . htmlentities($dir . $file) . "/\">" . htmlentities($file) . "</a></li>";
			}
		}
		// All files
		foreach( $files as $file ) {
			if( file_exists($dir . $file) && $file != '.' && $file != '..' && !is_dir($dir . $file) && preg_match($fitsregexp, $file)) {
				$ext = preg_replace('/^.*\./', '', $file);
				$tifexists = $ptifdir . preg_replace('/\//', '_', $file);
				echo "<li class=\"file ext_fits\"><a href=\"#\" rel=\"" . htmlentities($dir . $file) . "\">" . htmlentities($file) . "</a></li>";
			}
		}
		echo "</ul>";	
	}
}

?>
