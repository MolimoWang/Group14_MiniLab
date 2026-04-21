<template>
  <div id="app">
    <SubmissionForm />
  </div>
</template>

<script>
import SubmissionForm from './components/SubmissionForm.vue';

export default {
  name: 'App',
  components: { SubmissionForm }
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  text-align: center;
  color: #2c3e50;
  margin-top: 40px;
}
</style>
