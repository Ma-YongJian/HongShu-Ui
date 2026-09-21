<template>
	<view class="waterfall">
		<uv-waterfall ref="waterfall" v-model="list" column-count="2" :add-time="0" @changeList="changeList" column-gap="8">
			<template v-slot:list1>
				<view>
					<hs-note-card v-for="(item, index) in list1" :key="index" :item="item"
						@click="onClick" @user="onUser"></hs-note-card>
				</view>
			</template>
			<template v-slot:list2>
				<view>
					<hs-note-card v-for="(item, index) in list2" :key="index" :item="item"
						@click="onClick" @user="onUser"></hs-note-card>
				</view>
			</template>
		</uv-waterfall>
	</view>
</template>
<script>
	export default {
		props: {
			list: {
				type: Array,
				default: () => []
			}
		},
		data() {
			return {
				list1: [],
				list2: []
			}
		},
		methods: {
			changeList(e) {
				this[e.name].push(e.value)
			},
			onClick(item) {
				this.$emit('getImgInfo', item)
			},
			onUser(item) {
				this.$emit('user', item)
			},
			clear() {
				this.list1 = []
				this.list2 = []
			}
		}
	}
</script>
<style scoped>
	.waterfall {
		background-color: transparent;
	}
</style>
