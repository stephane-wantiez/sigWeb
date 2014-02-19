<?php
include('header.tpl');
?>

<script>
	var user = <?php echo $_SESSION['user']->toJSON(); ?>;
	var ENCRYPT_ENABLED = <?php echo (ENCRYPT_ENABLED ? 'true' : 'false'); ?>;
	var FB_APP_ID = "<?php echo FB_APP_ID; ?>";
	var LOCALE = "<?php echo $_SESSION['locale']; ?>";
</script>

</head>
<body>

<div id="screen">
    <canvas class="scene-view" width="1024" height="600"></canvas>
    <div id="gui"></div>
</div>

</body>
</html>